import { FormEvent, SyntheticEvent, useEffect, useState } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import api from '../../services/api';
import { Form, List, SubmitButton } from './styles';

interface IRepo {
  name: string;
}

const Repositories = () => {
  const [newRepo, setNewRepo] = useState('');
  const [repos, setRepos] = useState<IRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const storageRepos = localStorage.getItem('repos');

    if (storageRepos) {
      setRepos(JSON.parse(storageRepos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repos));
  }, [repos]);

  const handleInputChange = (e: FormEvent<HTMLInputElement>): void => {
    setNewRepo(e.currentTarget.value);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(false);

    try {
      if (newRepo === '')
        throw new Error('você precisa indicar um repositório');

      const response = await api.get(`/repos/${newRepo}`);

      const hasRepo = repos.find((repo) => repo.name === newRepo);

      if (hasRepo) throw new Error('Repositório duplicado');

      const data = {
        name: response.data.full_name
      };

      setRepos([...repos, data]);
      setNewRepo('');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>
        <FaGithubAlt />
        Repositories
      </h1>

      <Form onSubmit={handleSubmit} error={error}>
        <input
          type="text"
          placeholder="Add repository"
          value={newRepo}
          onChange={handleInputChange}
        />

        <SubmitButton loading={loading}>
          {loading ? (
            <FaSpinner color="#fff" size={14} />
          ) : (
            <FaPlus color="#fff" size={14} />
          )}
        </SubmitButton>
      </Form>

      <List>
        {repos.map((repository) => (
          <li key={repository.name}>
            <span>{repository.name}</span>
            <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
              Detalhes
            </Link>
          </li>
        ))}
      </List>
    </Container>
  );
};

export default Repositories;
