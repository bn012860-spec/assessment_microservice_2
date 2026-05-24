
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function ProblemListPage() {
  const [problems, setProblems] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    tag: ''
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.tag) params.append('tag', filters.tag);

    api.get(`/api/problems?\${params.toString()}`)
      .then(response => setProblems(response.data))
      .catch(error => console.error('Error fetching problems:', error));
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = (_id) => {
    api.delete(`/api/problems/${_id}`)
      .then(() => {
        setProblems(problems.filter(problem => problem._id !== _id));
      })
      .catch(error => console.error('Error deleting problem:', error));
  };

  return (
    <div className="container">
      <h2 className="mb-20">Problems</h2>
      <div className="flex-gap mb-20">
        <Link to="/add-problem" className="button">Add New Problem</Link>
        <div style={{ flex: 1 }}></div>
        <input 
          type="text" 
          name="search" 
          placeholder="Search problems..." 
          value={filters.search} 
          onChange={handleFilterChange}
          style={{ width: '250px' }}
        />
        <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} style={{ width: '150px' }}>
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input 
          type="text" 
          name="tag" 
          placeholder="Filter by tag..." 
          value={filters.tag} 
          onChange={handleFilterChange}
          style={{ width: '150px' }}
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Submissions</th>
              <th>Acceptance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map(problem => {
              const rate = problem.submissionCount > 0 
                ? ((problem.acceptedCount / problem.submissionCount) * 100).toFixed(1) + '%'
                : '0%';
              return (
                <tr key={problem._id}>
                  <td>
                    <Link to={`/problems/${problem._id}`}>{problem.title}</Link>
                  </td>
                  <td>{problem.difficulty}</td>
                  <td>{problem.submissionCount || 0}</td>
                  <td>{rate}</td>
                  <td>
                    <Link to={`/problems/${problem._id}/edit`} className="button">Edit</Link>
                    <button onClick={() => handleDelete(problem._id)} className="button button-danger">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProblemListPage;
