"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Loader2, Check, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface FeedbackWidgetProps {
  briefId: number;
  onSubmit?: () => void;
}

export function FeedbackWidget({ briefId, onSubmit }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      
      // Auto-close after a delay
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setThumbsUp(null);
    setFalsePositives(null);
    setFalsePositivesExplanation("");
    setMissingInfo(null);
    setMissingInfoExplanation("");
    setOtherFeedback("");
    setSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (submitted) {
    return (
      <>
        {/* Trigger Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-green-600" />
          Feedback Submitted
        </Button>
      </>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Give Feedback
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <Card className="border-0 shadow-2xl">
              <CardHeader className="relative">
                <CardTitle className="text-lg pr-8">How was this brief?</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
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
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || thumbsUp === null}
                    className="flex-1"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
} 