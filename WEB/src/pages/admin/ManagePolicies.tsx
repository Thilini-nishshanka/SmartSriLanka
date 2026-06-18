import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { policyService } from '@/services/policyService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Policy {
  id: number;
  slug: string;
  title: string;
  content: string;
}

const ManagePolicies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const data = await policyService.getAllPolicies();
        setPolicies(data);
        if (data.length > 0) {
          handlePolicyChange(data[0].slug);
        }
      } catch (error) {
        toast.error('Failed to load policies.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handlePolicyChange = (slug: string) => {
    const policy = policies.find(p => p.slug === slug);
    if (policy) {
      setSelectedPolicy(policy);
      setContent(policy.content);
    }
  };

  const handleSave = async () => {
    if (!selectedPolicy) return;
    setSaving(true);
    try {
      await policyService.updatePolicy(selectedPolicy.slug, content);
      toast.success(`"${selectedPolicy.title}" updated successfully.`);
      // Refetch to ensure data is fresh
      const data = await policyService.getAllPolicies();
      setPolicies(data);
    } catch (error) {
      toast.error('Failed to save policy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Manage Policy Pages</h1>
        <Card>
          <CardHeader>
            <CardTitle>Edit Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={handlePolicyChange} value={selectedPolicy?.slug}>
              <SelectTrigger>
                <SelectValue placeholder="Select a page to edit..." />
              </SelectTrigger>
              <SelectContent>
                {policies.map(p => (
                  <SelectItem key={p.slug} value={p.slug}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {loading ? <Loader2 className="animate-spin" /> : (
              <ReactQuill theme="snow" value={content} onChange={setContent} style={{ height: '400px', marginBottom: '50px' }} />
            )}

            <Button onClick={handleSave} disabled={saving || loading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ManagePolicies;