"use client";

import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { evaluate } from "@/lib/calculator-utils";
import type { StepByStepSolution } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdvanceCalculator() {
  const [input, setInput] = useState("");
  const [solution, setSolution] = useState<StepByStepSolution | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSolve = useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter an expression");
      return;
    }

    setLoading(true);
    try {
      // First try to evaluate the expression to check if it's valid
      const finalResult = evaluate(input);

      // Call the API for step-by-step solution
      const response = await fetch("/api/advance-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expression: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get solution");
      }

      const data = await response.json();
      //Checking the integration
      console.log("Data for debuggin:",data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Ensure the solution has the final calculated result
      setSolution({
        ...data,
        finalResult: finalResult,
      });
    } catch (error) {
      console.error(error);
      toast.error("Could not generate detailed solution. Showing basic steps.");
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors flex items-center justify-center"
        title="Back to Home"
      >
        <ArrowLeft className="h-6 w-6 text-gray-700" />
        <span className="sr-only">Back to Home</span>
      </Link>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Advanced Calculator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label
              htmlFor="expression"
              className="block text-md font-medium text-gray-700 mb-2"
            >
              Enter Mathematical Expression
            </label>
            <textarea
              id="expression"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your mathematical expression here (e.g., sin(45) + √(16) or [1,2;3,4])"
            />
          </div>

          <Button
            onClick={handleSolve}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Solving..." : "Solve Step by Step"}
          </Button>
        </div>

        {solution && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Solution</h2>

            {solution.error ? (
              <div className="text-red-500">{solution.error}</div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {solution.steps.map((step, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700 whitespace-pre-wrap">
                            {step.explanation}
                          </p>
                          {step.result && (
                            <div className="mt-2 font-mono bg-white p-2 rounded border border-gray-200 text-blue-600">
                              {step.result}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Final Result:</h3>
                  <div className="bg-blue-50 p-4 rounded-lg font-mono text-lg text-blue-700 border border-blue-100">
                    {solution.finalResult}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
