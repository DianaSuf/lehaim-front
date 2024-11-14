import { Font } from "@react-pdf/renderer";
import { useEffect, useState } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { ChartsDataUrl, AnalyzeDetailedInfo, RecommendationData, PatientAllGenesDto } from '../../types/CommonTypes';
import { ReportDTO } from '../../services/ReportService';
import { DiagnosisDTO } from '../../services/DiagnosisService';
import * as dateUtils from '../../components/DateUtils';

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf", fontWeight: 300 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf", fontWeight: 400 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf", fontWeight: 500 },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf", fontWeight: 600 },

  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 12,
    padding: 10,
    paddingBottom: 20
  },
  colontitul: {
    position: "absolute",
    left: '48%',
    bottom: 10
  },
  pagination: {
    position: "absolute",
    left: '85%',
    bottom: 10
  },
  header: {
    textAlign: "center",
    fontSize: 20,
    margin: 15
  },
  propertyLabel: {
    color: 'black'
  },
  propertyComment: {
    color: '#454545'
  },
  section: {
    flexDirection: 'row',
    padding: 5
  },
  sectionTitle: {
    textAlign: "center",
    margin: 10,
    fontSize: 14,
    fontWeight: 600
  },
  chartSection: {
    marginBottom: 15
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 14,
    margin: 10,
    fontWeight: 600
  },
  chart: {
    left: '25%',
    width: 300,
    height: 300
  },
  table: {
    paddingLeft: 5,
    paddingRight: 5,
    width: '100%'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    borderTop: '1px solid #EEE',
    paddingTop: 3,
    paddingBottom: 3,
  },
  tableHeader: {
    borderTop: 'none',
    textAlign: "center",
  },
  bold: {
    fontWeight: 'bold',
  },
  col1: {
    width: '5%',
    textAlign: "center",
  },
  col2: {
    width: '50%',
  },
  col3: {
    width: '15%',
    textAlign: "center",
  },
  col4: {
    width: '15%',
    textAlign: "center",
  },
  col5: {
    width: '15%',
    textAlign: "center",
  },

});

interface Props {
  reportData: ReportDTO,
  chartData?: ChartsDataUrl | null,
  diagnosisCatalog?: DiagnosisDTO[] | null,
  recommendationData?: RecommendationData | null
  patientGenes?: PatientAllGenesDto | null
}

interface ResultDataHolder {
  [key: number]: ResultData;
}

interface ResultData {
  current?: AnalyzeDetailedInfo | null,
  prev?: AnalyzeDetailedInfo | null
}

function PatientReport({ reportData, chartData, diagnosisCatalog, recommendationData, patientGenes }: Props) {
  const [resultMap, setResultMap] = useState<ResultData | null>(null);

  useEffect(() => {
    var mapData: ResultDataHolder = {};

    reportData.currentResults?.forEach((item => {
      if (item?.parameter?.id) {
        mapData[item.parameter.id] = { current: item };
      }
    }));
    reportData.previousResults?.forEach((item => {
      if (item?.parameter?.id) {
        mapData[item.parameter.id] = {
          current: mapData[item.parameter.id]?.current ?? null,
          prev: item
        };
      }
    }));
    setResultMap(mapData);
  }, [reportData]);

  const calcDiff = (prev?: number, current?: number): string => {
    if (prev && current) {
      return (((current - prev) / prev) * 100).toFixed(2) + "%";
    } else {
      return "-";
    }
  }

  const getDiagnosisName = (diagnosisId?: number,): string => {
    if (diagnosisCatalog && diagnosisId) {
      return diagnosisCatalog?.find((catalogItem) => {
        return catalogItem.id === diagnosisId
      })?.description ?? "";
    } else {
      return "-"
    }
  }

  const getGenes = (diagnosisId?: number): string => {
    if (diagnosisCatalog && patientGenes && diagnosisId) {
      const diagnosisGene = diagnosisCatalog?.find((catalogItem) => {
        return catalogItem.id === diagnosisId
      })?.genes;
      if (diagnosisGene && diagnosisGene.length > 0) {
        return diagnosisGene.map(genItem => {
          const gene = patientGenes[diagnosisId]?.find(gen => gen.geneId === genItem.id);
          return {
            name: genItem.geneName,
            value: gene?.geneValue ? gene?.geneValue : "N/A"
          }
        })
          .map(item => item.name + ": " + item.value)
          .join("; ");
      }
    }
    return "-";
  }

  const getParamName = (result: ResultData): string => {
    const actualData = result.current ?? result.prev;

    if (actualData) {
      return actualData.parameter!!.name + " (" + actualData.parameter!!.additionalName + ")";
    } else {
      return "-"
    }
  }

  return (
    <>
      <Document title={"Отчет " + reportData.patient.lastname + " " + reportData.patient.name + " от " + reportData.currentTestDate}>
        <Page size="A4" style={styles.page}>

          <View style={styles.header}>
            <Text>Отчет об обследовании за {dateUtils.formatDate(reportData.currentTestDate)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>ФИО: </Text>
              {reportData.patient.lastname} {reportData.patient.name} {reportData.patient.patronymic ?? ""}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Дата рождения: </Text>
              {dateUtils.formatDate(reportData.patient.birthdate)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Диагноз: </Text>
              {getDiagnosisName(reportData.patient.diagnosisId)};
              N: {reportData.patient.n};
              G: {reportData.patient.g};
              T: {reportData.patient.t};
              M: {reportData.patient.m};
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Гены: </Text>
              {getGenes(reportData.patient.diagnosisId)}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Комментарий о диагнозе: </Text>
              {reportData.patient.diagnosisComments}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Комментарий об операции: </Text>
              {reportData.patient.operationComments}
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Комментарий о курсах химиотерапии: </Text>
              {reportData.patient.chemotherapyComments}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.propertyComment}>
              <Text style={styles.propertyLabel}>Комментарий к обследованию: </Text>
              {reportData.currentTestNote}
            </Text>
          </View>

          {chartData?.regenerationChartData ?
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Расчет вида регенерации</Text>
              <Image
                style={styles.chart}
                source={chartData.regenerationChartData} />
            </View>
            : null
          }
          {recommendationData?.REGENERATION ?
            < View >
              {recommendationData.REGENERATION.conclusion ?
                <View style={styles.section}>
                  <Text style={styles.propertyComment}>
                    <Text style={styles.propertyLabel}>Заключение: </Text>
                    {recommendationData.REGENERATION.conclusion}
                  </Text>
                </View>
                : null
              }
              {recommendationData.REGENERATION.recommendation ?
                <View style={styles.section}>
                  <Text style={styles.propertyComment}>
                    <Text style={styles.propertyLabel}>Рекомендация: </Text>
                    {recommendationData.REGENERATION.recommendation}
                  </Text>
                </View>
                : null
              }

            </View>
            : null
          }

          {chartData?.inflammationTypeData ?
            <View style={styles.chartSection} wrap={false}>
              <Text style={styles.chartTitle}>Индексы системного воспаления</Text>
              <Image
                style={styles.chart}
                source={chartData.inflammationTypeData} />
            </View>
            : null
          }

          {chartData?.bTypeData ?
            <View style={styles.chartSection} wrap={false}>
              <Text style={styles.chartTitle}>Относительные параметры B - клеточного звена иммунитета</Text>
              <Image
                style={styles.chart}
                source={chartData.bTypeData} />
            </View>
            : null
          }

          {chartData?.tTypeData ?
            <View style={styles.chartSection} wrap={false}>
              <Text style={styles.chartTitle}>Относительные параметры T - клеточного звена иммунитета</Text>
              <Image
                style={styles.chart}
                source={chartData.tTypeData} />
            </View>
            : null
          }

          {chartData?.cytokineTypeData ?
            <View style={styles.chartSection} wrap={false}>
              <Text style={styles.chartTitle}>Цитокиновые пары</Text>
              <Image
                style={styles.chart}
                source={chartData.cytokineTypeData} />
            </View>
            : null
          }

          {recommendationData?.CYTOKINE_PAIRS ?
            < View >
              {recommendationData.CYTOKINE_PAIRS.conclusion ?
                <View style={styles.section}>
                  <Text style={styles.propertyComment}>
                    <Text style={styles.propertyLabel}>Заключение: </Text>
                    {recommendationData.CYTOKINE_PAIRS.conclusion}
                  </Text>
                </View>
                : null
              }
              {recommendationData.CYTOKINE_PAIRS.recommendation ?
                <View style={styles.section}>
                  <Text style={styles.propertyComment}>
                    <Text style={styles.propertyLabel}>Рекомендация: </Text>
                    {recommendationData.CYTOKINE_PAIRS.recommendation}
                  </Text>
                </View>
                : null
              }
            </View>
            : null
          }

          {resultMap &&
            <View>
              <Text style={styles.sectionTitle}>Сравнение показателей</Text>
              <View style={styles.table}>
                <View style={[styles.row, styles.bold, styles.tableHeader]}>
                  <Text style={styles.col1}>№</Text>
                  <Text style={styles.col2}>Наименование</Text>
                  <Text style={styles.col3}>Предыдущие (средние)</Text>
                  <Text style={styles.col4}>Текущие</Text>
                  <Text style={styles.col5}>Изменение</Text>
                </View>
                {Object.entries(resultMap)
                  .map(([key, value], index) =>
                    <View style={[styles.row]} wrap={false} key={index}>
                      <Text style={styles.col1}>{index + 1}</Text>
                      <Text style={styles.col2}>{getParamName(value)}</Text>
                      <Text style={styles.col3}>{value.prev?.value.toFixed(2) ?? "-"}</Text>
                      <Text style={styles.col4}>{value.current?.value.toFixed(2) ?? "-"}</Text>
                      <Text style={styles.col5}>{calcDiff(value?.prev?.value, value?.current?.value)}</Text>
                    </View>
                  )}
              </View>
            </View>
          }

          <Text style={styles.pagination} render={({ pageNumber, totalPages }) => (
            `Страница ${pageNumber} из ${totalPages}`

          )} fixed />
          <Text style={styles.colontitul} fixed>
            Le Ha Im
          </Text>

        </Page>
      </Document >
    </>
  )
}

export default PatientReport;