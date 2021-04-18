import { useEffect, useMemo, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import Container from '../../components/Container';
import api from '../../services/api';
import { IssueFilter, IssueList, Loading, Owner, PageActions } from './styles';

interface MatchParams {
  repository: string;
}

interface MatchProps extends RouteComponentProps<MatchParams> {}

interface ILabel {
  id: number;
  name: string;
}

interface IIssue {
  id: number;
  title: string;
  labels: ILabel[];
  html_url: string;
  user: {
    avatar_url: string;
    login: string;
  };
}

const Repository = ({ match }: MatchProps) => {
  const [repository, setRepository] = useState<any | null>(null);
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIndex, setFilterIndex] = useState(0);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => [
      { state: 'all', label: 'All', active: true },
      { state: 'open', label: 'Open', active: false },
      { state: 'closed', label: 'Closed', active: false }
    ],
    []
  );

  useEffect(() => {
    const getRepo = async () => {
      const repoName = decodeURIComponent(match.params.repository);

      const [reposData, issuesData] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: filters.find((f) => f.active)?.state,
            per_page: 5
          }
        })
      ]);

      setRepository(reposData.data);
      setIssues(issuesData.data);
      setLoading(false);
    };

    getRepo();
  }, [match.params.repository, filters]);

  const loadIssues = async () => {
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page
      }
    });

    setIssues(response.data);
  };

  const handleFilterClick = async (filterIndex: number) => {
    setFilterIndex(filterIndex);
    loadIssues();
  };

  const handlePage = async (action: string) => {
    setPage(action === 'back' ? page - 1 : page + 1);
    loadIssues();
  };

  if (loading) {
    return <Loading>Loading</Loading>;
  }

  return (
    <Container>
      <Owner>
        <Link to="/">Back to repositories</Link>
        <img src={repository.owner.avatar_url} alt={repository.owner.login} />
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
      </Owner>

      <IssueList>
        <IssueFilter active={filterIndex}>
          {filters.map((filter, index) => (
            <button
              type="button"
              key={filter.label}
              onClick={() => handleFilterClick(index)}
            >
              {filter.label}
            </button>
          ))}
        </IssueFilter>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
                {issue.labels.map((label) => (
                  <span key={String(label.id)}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
      </IssueList>
      <PageActions>
        <button
          type="button"
          disabled={page < 2}
          onClick={() => handlePage('back')}
        >
          Back
        </button>
        <span>Page: {page}</span>
        <button type="button" onClick={() => handlePage('next')}>
          Next
        </button>
      </PageActions>
    </Container>
  );
};

export default Repository;
