import { useOne, useUpdate } from '@refinedev/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Info } from 'lucide-react';

// Field prompt definitions by section number (matching Nova NdisPromptDefinition)
const SECTION_FIELD_PROMPTS: Record<number, { key: string; label: string; help: string }[]> = {
  1: [
    { key: 'incident_type', label: 'Incident Type Instructions', help: 'Tell the AI to classify using one of the available incident types.' },
    { key: 'severity', label: 'Severity Instructions', help: 'Guide the AI on how to assess severity (Minor, Moderate, Serious, Critical).' },
    { key: 'key_contributing_factors', label: 'Key Contributing Factors Instructions', help: 'Ask the AI to identify specific factors that contributed to the incident.' },
  ],
  2: [
    { key: 'incident_date_time', label: 'Incident Date/Time Instructions', help: 'Tell the AI how to extract or infer the date and time.' },
    { key: 'location', label: 'Location Instructions', help: 'Guide the AI on how to identify where the incident occurred.' },
    { key: 'draft_Summary', label: 'Draft Summary Instructions', help: 'Describe what kind of summary the AI should create.' },
  ],
  3: [
    { key: 'what_happened', label: 'What Happened Instructions', help: 'Guide the AI to describe observable facts in chronological order.' },
    { key: 'lead_up_triggers', label: 'Lead-Up & Triggers Instructions', help: 'Ask the AI to identify events and triggers that preceded the incident.' },
    { key: 'during_incident', label: 'During Incident Instructions', help: 'Focus on observable behaviors and actions during the incident.' },
    { key: 'response_actions', label: 'Response Actions Instructions', help: 'Ask the AI to detail how staff responded to the incident.' },
    { key: 'causes_contributing_factors', label: 'Causes & Contributing Factors Instructions', help: 'Guide the AI to analyze root causes and systemic issues.' },
  ],
  4: [
    { key: 'injury_occurred', label: 'Injury Occurred Instructions', help: 'Ask the AI to determine if anyone was injured.' },
    { key: 'medical_treatment_required', label: 'Medical Treatment Required Instructions', help: 'Guide the AI on assessing whether medical treatment was needed.' },
    { key: 'injury_details', label: 'Injury Details Instructions', help: 'Tell the AI what injury information to include.' },
  ],
  5: [
    { key: 'is_ndis_reportable', label: 'NDIS Reportable Instructions', help: 'Guide the AI on criteria for NDIS reportability.' },
    { key: 'police_notified', label: 'Police Notified Instructions', help: 'Tell the AI when police involvement should be flagged.' },
  ],
  6: [
    { key: 'bsp_alignment_notes', label: 'BSP Alignment Notes Instructions', help: 'Ask the AI to analyze how the incident relates to the BSP.' },
    { key: 'bsp_suggested_improvements', label: 'BSP Suggested Improvements Instructions', help: 'Guide the AI on suggesting actionable improvements to the BSP.' },
  ],
  7: [
    { key: 'follow_up_required', label: 'Follow-Up Required Instructions', help: 'Tell the AI how to assess if follow-up actions are needed.' },
    { key: 'follow_up_actions', label: 'Follow-Up Actions Instructions', help: 'Guide the AI on recommending specific follow-up steps.' },
  ],
  8: [
    { key: 'additional_information', label: 'Additional Information Instructions', help: 'Tell the AI what other relevant context to include.' },
    { key: 'generated_report', label: 'Generated Report Instructions', help: 'Guide the AI on compiling a complete NDIS-compliant report.' },
    { key: 'behavioral_identified', label: 'Behavioral Identified Instructions', help: 'Tell the AI how to determine if behavioral patterns were identified.' },
    { key: 'trigger_extracted', label: 'Trigger Extracted Instructions', help: 'Guide the AI on identifying if specific triggers were found.' },
    { key: 'bsp_aligned', label: 'BSP Aligned Instructions', help: 'Tell the AI how to assess if BSP alignment analysis is available.' },
    { key: 'restrictive_practice_used', label: 'Restrictive Practice Used Instructions', help: 'Guide the AI on identifying restrictive practices.' },
  ],
};

export function NdisPromptEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mutate: update, isLoading: saving } = useUpdate();
  const { data, isLoading, isError } = useOne({
    resource: 'ndis-prompts',
    id: id!,
    errorNotification: false,
    queryOptions: { retry: false },
  });

  const [mainPrompt, setMainPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [fieldPrompts, setFieldPrompts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.data) {
      const record = data.data as any;
      setMainPrompt(record.main_prompt || '');
      setTemperature(record.temperature ?? 0.3);
      setFieldPrompts(record.field_prompts || {});
    }
  }, [data]);

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
  const sectionNumber = record?.section_number || 0;
  const sectionFields = SECTION_FIELD_PROMPTS[sectionNumber] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(
      {
        resource: 'ndis-prompts',
        id: id!,
        values: {
          main_prompt: mainPrompt,
          temperature,
          field_prompts: fieldPrompts,
        },
      },
      { onSuccess: () => navigate(`/ndis-prompts/show/${id}`) }
    );
  };

  const updateFieldPrompt = (key: string, value: string) => {
    setFieldPrompts(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/ndis-prompts/show/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Info */}
        <Card>
          <CardHeader>
            <CardTitle>Edit NDIS Prompt — Section {sectionNumber}</CardTitle>
            <CardDescription className="text-base">{record?.section_name}</CardDescription>
          </CardHeader>
          {record?.section_description && (
            <CardContent>
              <div className="bg-amber-50 border-2 border-amber-400 rounded-md p-3 flex gap-2">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 italic">{record.section_description}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Main Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Main Prompt</CardTitle>
            <CardDescription>
              Write clear, natural language instructions for the AI. This is the primary guidance for this section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              placeholder="Write clear, natural language instructions for the AI..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Field-Specific Prompts */}
        {sectionFields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Instructions</CardTitle>
              <CardDescription>
                Customize the AI's behavior for each specific field in this section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sectionFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <p className="text-xs text-muted-foreground mb-2">💡 {field.help}</p>
                  <Textarea
                    value={fieldPrompts[field.key] || ''}
                    onChange={(e) => updateFieldPrompt(field.key, e.target.value)}
                    placeholder={`Instructions for ${field.label.replace(' Instructions', '').toLowerCase()}...`}
                    rows={3}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Temperature Control */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🌡️ AI Temperature Control</CardTitle>
            <CardDescription>
              Control how strictly the AI follows instructions vs how creative it can be.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  Current: {temperature.toFixed(1)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>0.0 - 0.3:</strong> Very strict, follows instructions exactly (recommended for classification)</p>
                <p><strong>0.4 - 0.7:</strong> Balanced creativity and accuracy (good for narrative sections)</p>
                <p><strong>0.8 - 1.2:</strong> More creative and varied responses</p>
                <p><strong>1.3 - 2.0:</strong> Highly creative, less predictable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(`/ndis-prompts/show/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
