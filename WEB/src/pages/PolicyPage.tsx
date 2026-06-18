import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { policyService } from '@/services/policyService';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Policy {
  title: string;
  content: string;
}

const PolicyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await policyService.getPolicyBySlug(slug);
        setPolicy(data);
      } catch (err) {
        setError('Failed to load page content.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [slug]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {loading && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}
      {error && <div className="text-center text-destructive">{error}</div>}
      {policy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{policy.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: policy.content }} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyPage;