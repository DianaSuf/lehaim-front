import { RecommendationData, Recommendation } from "../types/CommonTypes";
import { handleResponse } from "./ResponseHandler"
import { ApiHost } from "../config";

export async function getRecommendationById(testId: number): Promise<RecommendationData> {
  const response = await fetch(ApiHost + '/recommendations/' + testId, { method: "GET" });
  return await handleResponse<RecommendationData>(response, "Ошибка загрузки сведений о рекомендациях");
}

export async function saveNewRecommendation(recommendation: Recommendation, testId: number, chartType: string): Promise<Recommendation> {
  const response = await fetch(ApiHost + "/recommendations/" + testId + "/" + chartType,
      {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recommendation)
      }
  );
  return await handleResponse<Recommendation>(response, "Ошибка сохранения рекомендации");
}

export async function updateRecommendation(recommendation: Recommendation, recommendationId: string): Promise<Recommendation> {
  const response = await fetch(ApiHost + "/recommendations/edit/" + recommendationId,
      {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recommendation)
      }
  );
  return await handleResponse<Recommendation>(response, "Ошибка сохранения сведений о рекомендации");
}
