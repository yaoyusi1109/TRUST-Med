import examples from "@/data/examples.json";
import type { ExamplesData } from "@/types";
import { PreferenceReviewExample } from "./PreferenceReviewExample";

const examplesData = examples as ExamplesData;

export default function PreferenceReviewPage() {
  return <PreferenceReviewExample example={examplesData.preferenceReview} />;
}
