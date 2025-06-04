"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface FeedbackWidgetProps {
  briefId: number;
  onSubmit?: () => void;
}

export function FeedbackWidget({ briefId, onSubmit }: FeedbackWidgetProps) {
  const [thumbsUp, setThumbsUp] = useState<boolean | null>(null);
  const [falsePositives, setFalsePositives] = useState<boolean | null>(null);
  const [falsePositivesExplanation, setFalsePositivesExplanation] = useState("");
  const [missingInfo, setMissingInfo] = useState<boolean | null>(null);
  const [missingInfoExplanation, setMissingInfoExplanation] = useState("");
  const [otherFeedback, setOtherFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (thumbsUp === null) {
      toast("Please select thumbs up or down");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          briefId,
          thumbsUp,
          falsePositivesFound: falsePositives,
          falsePositivesExplanation: falsePositivesExplanation.trim() || null,
          missingInfoFound: missingInfo,
          missingInfoExplanation: missingInfoExplanation.trim() || null,
          otherFeedback: otherFeedback.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSubmitted(true);
      toast("Thank you for your feedback!");
      onSubmit?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">How was this brief?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Thumbs Up/Down */}
        <div className="space-y-2">
          <Label>Rate this brief</Label>
          <div className="flex gap-2">
            <Button
              variant={thumbsUp === true ? "default" : "outline"}
              size="sm"
              onClick={() => setThumbsUp(true)}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Good
            </Button>
            <Button
              variant={thumbsUp === false ? "default" : "outline"}
              size="sm"
              onClick={() => setThumbsUp(false)}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Poor
            </Button>
          </div>
        </div>

        {/* False Positives */}
        <div className="space-y-2">
          <Label>Were there any false positives? (incorrect information)</Label>
          <div className="flex gap-2">
            <Button
              variant={falsePositives === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFalsePositives(true)}
            >
              Yes
            </Button>
            <Button
              variant={falsePositives === false ? "default" : "outline"}
              size="sm"
              onClick={() => setFalsePositives(false)}
            >
              No
            </Button>
          </div>
          {falsePositives === true && (
            <Textarea
              placeholder="Please explain what information was incorrect..."
              value={falsePositivesExplanation}
              onChange={(e) => setFalsePositivesExplanation(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        {/* Missing Info */}
        <div className="space-y-2">
          <Label>Was there anything you expected to see but didn&apos;t?</Label>
          <div className="flex gap-2">
            <Button
              variant={missingInfo === true ? "default" : "outline"}
              size="sm"
              onClick={() => setMissingInfo(true)}
            >
              Yes
            </Button>
            <Button
              variant={missingInfo === false ? "default" : "outline"}
              size="sm"
              onClick={() => setMissingInfo(false)}
            >
              No
            </Button>
          </div>
          {missingInfo === true && (
            <Textarea
              placeholder="Please describe what was missing..."
              value={missingInfoExplanation}
              onChange={(e) => setMissingInfoExplanation(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        {/* Other Feedback */}
        <div className="space-y-2">
          <Label>Any other feedback? (optional)</Label>
          <Textarea
            placeholder="Share any other thoughts or suggestions..."
            value={otherFeedback}
            onChange={(e) => setOtherFeedback(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || thumbsUp === null}
          className="w-full"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
} 