"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar, User, Building } from "lucide-react";
import { toast } from "sonner";

interface BriefHistoryItem {
  id: number;
  name: string;
  organization: string;
  brief_content: string;
  created_at: string;
}

export function BriefHistory() {
  const { user } = useAuth();
  const [briefs, setBriefs] = useState<BriefHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBrief, setExpandedBrief] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchBriefs();
    }
  }, [user]);

  const fetchBriefs = async () => {
    try {
      const response = await fetch('/api/brief-history', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBriefs(data.briefs || []);
      } else {
        toast("Failed to load brief history");
      }
    } catch (error) {
      console.error('Failed to fetch briefs:', error);
      toast("Failed to load brief history");
    } finally {
      setLoading(false);
    }
  };

  const filteredBriefs = briefs.filter(brief =>
    brief.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyBrief = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast('Brief copied to clipboard');
    } catch (error) {
      console.error('Copy failed:', error);
      toast('Copy failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="ml-2">Loading brief history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by person or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brief Cards */}
      {filteredBriefs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'No briefs found matching your search.' : 'No briefs generated yet.'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Generate your first brief using the form above!
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBriefs.map((brief) => (
            <Card key={brief.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {brief.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDate(brief.created_at)}
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {brief.organization}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedBrief(
                      expandedBrief === brief.id ? null : brief.id
                    )}
                  >
                    {expandedBrief === brief.id ? 'Collapse' : 'View Full Brief'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyBrief(brief.brief_content)}
                  >
                    Copy Brief
                  </Button>
                </div>
                
                {expandedBrief === brief.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div 
                      className="prose prose-sm prose-slate max-w-none text-left prose-li:marker:text-slate-600"
                      dangerouslySetInnerHTML={{ __html: brief.brief_content }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 