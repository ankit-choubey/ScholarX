import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Loader from '../components/common/Loader';
import { getAnalytics } from '../services/editorService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, formatDate } from '../utils/helpers';
import PageHeader from '../components/common/PageHeader';
import InfoCard from '../components/common/InfoCard';
import EmptyState from '../components/common/EmptyState';
import '../components/common/ui.css';

function ChartShell({ title, description, data, children }) {
  return (
    <section className="section-card" style={{ minHeight: 360, padding: '1.4rem' }}>
      <h2>{title}</h2>
      {description ? <p className="helper-text mb-3">{description}</p> : null}
      {Array.isArray(data) && data.length ? children : (
        <EmptyState title="No data yet" body="Submit and review papers to populate analytics." />
      )}
    </section>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'editor') {
      setLoading(false);
      return;
    }
    getAnalytics()
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Loader fullScreen label="Loading analytics..." />;

  if (user?.role !== 'editor') {
    return (
      <main className="page-shell">
        <EmptyState title="Access Restricted" body="Analytics are only available to editors." />
      </main>
    );
  }

  const statusData = Object.entries(data?.statusDistribution || {}).map(([name, value]) => ({ name, value }));

  const reviewDecisionData = data?.reviewDecisionDistribution || [];
  const submissionsOverTime = data?.submissionsOverTime || [];
  const publicationsOverTime = data?.publicationsOverTime || [];

  return (
    <main className="page-shell" style={{ maxWidth: 1280 }}>
      <PageHeader title="Analytics" subtitle={`Updated ${formatDate(new Date())}`} />

      <section className="section-card">
        <div className="info-grid">
          <InfoCard label="Total Submissions" value={data?.totalSubmissions ?? 0} />
          <InfoCard label="Total Publications" value={data?.totalPublications ?? 0} />
          <InfoCard label="Total Reviews" value={data?.totalReviews ?? 0} />
          <InfoCard label="Pending Reviews" value={data?.pendingReviews ?? 0} />
          <InfoCard label="Accepted Papers" value={data?.acceptedPapers ?? 0} />
          <InfoCard label="Revision Required" value={data?.revisionRequiredPapers ?? 0} />
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartShell title="Submissions Over Time" description="Monthly manuscript intake trend over the recent period." data={submissionsOverTime}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={submissionsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f8ef7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Status Distribution" description="Current distribution of manuscripts across lifecycle states." data={statusData}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#d4af37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartShell title="Review Decisions Distribution" description="Breakdown of reviewer outcomes submitted so far." data={reviewDecisionData}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reviewDecisionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="decision" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2dd4bf" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Publications Over Time" description="Monthly publication output after editorial acceptance." data={publicationsOverTime}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={publicationsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#d4af37" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>
    </main>
  );
}
