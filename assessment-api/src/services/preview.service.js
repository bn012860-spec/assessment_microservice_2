import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { validateData, isValidType } from "../utils/typeValidator.mjs";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

function loadSchema(schemaName) {
  const schemaPath = path.resolve(`./contracts/${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) {
    // Fallback for different working directories
    const altPath = path.resolve(`../contracts/${schemaName}.schema.json`);
    return JSON.parse(fs.readFileSync(altPath, 'utf8'));
  }
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

const problemSchema = loadSchema('problem');
const validateSchema = ajv.compile(problemSchema);

export async function validateProblemDefinition(problem) {
  const report = {
    schemaValid: false,
    typeValidation: false,
    wrapperGeneration: false,
    errors: []
  };

  // Stage 1: Schema Validation
  if (!validateSchema(problem)) {
    report.errors = (validateSchema.errors || []).map(err => `${err.instancePath || 'root'}: ${err.message}`);
    return report;
  }
  report.schemaValid = true;

  // Stage 2: Type Conversion Validation
  try {
    for (const param of problem.parameters) {
      if (!isValidType(param.type)) {
        report.errors.push(`Invalid type string for parameter '${param.name}': ${param.type}`);
      }
    }
    if (!isValidType(problem.returnType)) {
      report.errors.push(`Invalid returnType string: ${problem.returnType}`);
    }

    if (report.errors.length === 0) {
      for (let i = 0; i < problem.testCases.length; i++) {
        const tc = problem.testCases[i];
        if (tc.inputs.length !== problem.parameters.length) {
          report.errors.push(`Test case [${i}]: expected ${problem.parameters.length} inputs, got ${tc.inputs.length}`);
          continue;
        }

        for (let j = 0; j < tc.inputs.length; j++) {
          const res = validateData(tc.inputs[j], problem.parameters[j].type);
          if (!res.valid) {
            report.errors.push(`Test case [${i}] parameter '${problem.parameters[j].name}': ${res.error}`);
          }
        }

        const resExpected = validateData(tc.expected, problem.returnType);
        if (!resExpected.valid) {
          report.errors.push(`Test case [${i}] expected output: ${resExpected.error}`);
        }
      }
    }

    if (report.errors.length === 0) {
      report.typeValidation = true;
    }
  } catch (err) {
    report.errors.push(`Type validation crashed: ${err.message}`);
  }

  // Stage 3: Wrapper Generation
  if (report.typeValidation) {
    try {
      const languages = ['javascript', 'python', 'java'];
      for (const lang of languages) {
        await buildPreview({ problem, language: lang });
      }
      report.wrapperGeneration = true;
    } catch (err) {
      report.errors.push(`Wrapper generation failed: ${err.message}`);
    }
  }

  return report;
}

export async function buildPreview({ problem, language }) {
  if (!problem || !language) {
    const err = new Error("Missing problem or language in request");
    err.status = 400;
    err.body = { msg: "Missing problem or language in request" };
    throw err;
  }

  const langTplFile = {
    javascript: "js_wrapper.tpl",
    python: "python_wrapper.tpl",
    java: "java_wrapper.tpl",
    c: "c_wrapper.tpl",
    csharp: "csharp_wrapper.tpl"
  }[language] || "js_wrapper.tpl";

  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.default.join(process.cwd(), "judge-service-go", "pkg", "wrappers", langTplFile);
  let tpl = "";
  try {
    tpl = fs.default.readFileSync(filePath, "utf8");
  } catch (err) {
    console.warn("Failed to read template for preview, using fallback template:", err.message);
    if (language === "python") {
      tpl = "# wrapper preview for python\n# TESTS: {{TESTS_JSON}}\n# FUNCTION: {{FUNCTION_NAME}}\n# USER_CODE_MARKER";
    } else if (language === "java") {
      tpl = "// wrapper preview for java\n// TESTS: {{TESTS_JSON}}\n// FUNCTION: {{FUNCTION_NAME}}\n// CLASS: {{CLASS_NAME}}\n// USER_CODE_MARKER";
    } else {
      tpl = "// wrapper preview for js\n// TESTS: {{TESTS_JSON}}\n// FUNCTION: {{FUNCTION_NAME}}\n// USER_CODE_MARKER";
    }
  }

  const tests = (problem.testCases || []).map((tc) => ({
    inputs: tc.inputs,
    expected: tc.expected,
    isHidden: !!tc.isHidden
  }));

  const testsJSON = JSON.stringify(tests);
  const functionName = problem.functionName || "solution";
  tpl = tpl.replace(/{{TESTS_JSON}}/g, testsJSON);
  tpl = tpl.replace(/{{FUNCTION_NAME}}/g, functionName);
  tpl = tpl.replace(/{{CLASS_NAME}}/g, functionName);

  return { wrapper: tpl, tests: tests };
}
