import { useOne } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Pencil, Info } from 'lucide-react';

// Field prompt labels by key (matching the edit component)
const FIELD_PROMPT_LABELS: Record<string, string> = {
  incident_type: 'Incident Type Instructions',
  severity: 'Severity Instructions',
  key_contributing_factors: 'Key Contributing Factors Instructions',
  incident_date_time: 'Incident Date/Time Instructions',
  location: 'Location Instructions',
  draft_Summary: 'Draft Summary Instructions',
  what_happened: 'What Happened Instructions',
  lead_up_triggers: 'Lead-Up & Triggers Instructions',
  during_incident: 'During Incident Instructions',
  response_actions: 'Response Actions Instructions',
  causes_contributing_factors: 'Causes & Contributing Factors Instructions',
  injury_occurred: 'Injury Occurred Instructions',
  medical_treatment_required: 'Medical Treatment Required Instructions',
  injury_details: 'Injury Details Instructions',
  is_ndis_reportable: 'NDIS Reportable Instructions',
  police_notified: 'Police Notified Instructions',
  bsp_alignment_notes: 'BSP Alignment Notes Instructions',
  bsp_suggested_improvements: 'BSP Suggested Improvements Instructions',
  follow_up_required: 'Follow-Up Required Instructions',
  follow_up_actions: 'Follow-Up Actions Instructions',
  additional_information: 'Additional Information Instructions',
  generated_report: 'Generated Report Instructions',
  behavioral_identified: 'Behavioral Identified Instructions',
  trigger_extracted: 'Trigger Extracted Instructions',
  bsp_aligned: 'BSP Aligned Instructions',
  restrictive_practice_used: 'Restrictive Practice Used Instructions',
};

export function NdisPromptShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOne({
    resource: 'ndis-prompts',
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) {
    return (
      <div className="p-4 space-y-4">
        <Button variant="ghost" onClick={() => navigate('/ndis-prompts')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to NDIS Prompts
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load NDIS Prompt #{id}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const record = data?.data as any;
  if (!record) return <p className="p-4">Not found</p>;

  const fieldPrompts = record.field_prompts || {};
  const hasFieldPrompts = Object.keys(fieldPrompts).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/ndis-prompts')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to NDIS Prompts
        </Button>
        <Button onClick={() => navigate(`/ndis-prompts/edit/${id}`)}>
          <Pencil className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Section Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Section {record.section_number}: {record.section_name}</CardTitle>
              {record.section_description && (
                <CardDescription className="mt-2 max-w-2xl">{record.section_description}</CardDescription>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Temperature</span>
              <p className="text-2xl font-bold">{(record.temperature ?? 0.3).toFixed(1)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Prompt */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Main Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          {record.main_prompt ? (
            <p className="whitespace-pre-wrap text-sm">{record.main_prompt}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No main prompt configured</p>
          )}
        </CardContent>
      </Card>

      {/* Field Prompts */}
      {hasFieldPrompts && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Field Instructions</CardTitle>
            <CardDescription>Specific instructions for each field in this section</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(fieldPrompts as Record<string, string>)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <h4 className="text-sm font-medium">
                    {FIELD_PROMPT_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </h4>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">{value}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ID</span>
            <span className="text-sm font-medium">{record.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm font-medium">
              {record.created_at ? new Date(record.created_at).toLocaleString() : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm font-medium">
              {record.updated_at ? new Date(record.updated_at).toLocaleString() : '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
