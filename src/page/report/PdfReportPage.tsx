import { PDFViewer } from '@react-pdf/renderer';
import PatientReport from './PdfReportTemplate';
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import RadarChart from '../chart/RadarChart';
import { ChartType, ChartsDataUrl, ChartType2, RecommendationData } from '../../types/CommonTypes';
import * as reportService from '../../services/ReportService';
import * as diagnosisService from '../../services/DiagnosisService';
import { ReportDTO } from '../../services/ReportService';
import { DiagnosisDTO } from '../../services/DiagnosisService';
import * as recommendationsServise from '../../services/RecommendationService';

function PdfReportDemoPage() {
    const [chartData, setChartData] = useState<ChartsDataUrl | null>(null);
    const [reportData, setReportData] = useState<ReportDTO | null>(null);
    const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
    const [readyForBuildPdf, setReadyForBuildPdf] = useState<boolean>(false);
    const [diagnosisCatalog, setDiagnosisCatalog] = useState<DiagnosisDTO[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { patientId, testId } = useParams();

    useEffect(() => {
        const loadReportData = async () => {
            setLoading(true);
            try {
                const reportData = await reportService.loadPatientReport(patientId!!, Number(testId));
                setReportData(reportData);
                const diagnosis = await diagnosisService.loadAllDiagnosis();
                setDiagnosisCatalog(diagnosis);

                const recommendation = await loadRecommendations();
                setRecommendationData(recommendation);
            } catch (err) {
                if (err instanceof Error) {
                    setError("Ошибка: " + err.message);
                } else {
                    setError("Ошибка загрузки: " + err);
                }
            }
        }

        const loadRecommendations = async (): Promise<RecommendationData> => {
            const recommendationData: RecommendationData = {}
            try {
                recommendationData.regeneration = await recommendationsServise.getRecommendationById(Number(testId), ChartType2.Regeneration_Type);
            } catch (err) {
                recommendationData.regeneration = null;
            }
            try {
                recommendationData.cytokine = await recommendationsServise.getRecommendationById(Number(testId), ChartType2.Cytokine_Type);
            } catch (err) {
                recommendationData.cytokine = null;
            }
            //TODO Load other types
            return recommendationData;
        }


        console.log("Before loadind report data");
        setChartData(null);
        setReportData(null);
        setReadyForBuildPdf(false);
        loadReportData();
    }, [patientId, testId]);

    useEffect(() => {
        if (reportData && chartData) {
            setTimeout(() => {
                setLoading(false);
                setReadyForBuildPdf(true);
            }, 1000);
        }
    }, [reportData, chartData]);


    const chartDataUrlHandler = (chartType: ChartType, chartDataUrl: string) => {
        if (chartDataUrl) {
            if (chartType === ChartType.Regeneration_Type) {
                setChartData(prevData => ({ ...prevData, ['regenerationChartData']: chartDataUrl }))
            } else if (chartType === ChartType.B_Type) {
                setChartData(prevData => ({ ...prevData, ['bTypeData']: chartDataUrl }))
            } else if (chartType === ChartType.T_Type) {
                setChartData(prevData => ({ ...prevData, ['tTypeData']: chartDataUrl }))
            } else if (chartType === ChartType.Cytokine_Type) {
                setChartData(prevData => ({ ...prevData, ['cytokineTypeData']: chartDataUrl }))
            } else if (chartType === ChartType.Inflammation_Type) {
                setChartData(prevData => ({ ...prevData, ['inflammationTypeData']: chartDataUrl }))
            }
        }
    }

    return (
        <>
            {loading &&
                <div className='container'>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                </div>
            }
            {error &&
                <div className="container">
                    <h3>{error}</h3>
                </div>
            }
            {
                reportData && (
                    <div>
                        {
                            readyForBuildPdf && (
                                <PDFViewer width={'100%'} height={window.innerHeight - 7}>
                                    <PatientReport
                                        reportData={reportData}
                                        chartData={chartData}
                                        diagnosisCatalog={diagnosisCatalog}
                                        recommendationData={recommendationData}
                                    />
                                </PDFViewer>
                            )
                        }
                        <div style={{ "display": "none" }}>
                            <RadarChart
                                chartType={ChartType.Regeneration_Type}
                                data={reportData.currentResults}
                                dataUrlHandler={chartDataUrlHandler}
                                printMode={true} />
                            <RadarChart
                                chartType={ChartType.Inflammation_Type}
                                data={reportData.currentResults}
                                dataUrlHandler={chartDataUrlHandler}
                                printMode={true} />
                            <RadarChart
                                chartType={ChartType.B_Type}
                                data={reportData.currentResults}
                                dataUrlHandler={chartDataUrlHandler}
                                printMode={true} />
                            <RadarChart
                                chartType={ChartType.T_Type}
                                data={reportData.currentResults}
                                dataUrlHandler={chartDataUrlHandler}
                                printMode={true} />
                            <RadarChart
                                chartType={ChartType.Cytokine_Type}
                                data={reportData.currentResults}
                                dataUrlHandler={chartDataUrlHandler}
                                printMode={true} />
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default PdfReportDemoPage;