import { AnalyzeDetailedInfo, ChartPage } from "../../types/CommonTypes";
import { ChartType } from "../../types/CommonTypes";

interface Indicator {
    name: string;
    max?: number
}

interface ChartDataParam {
    min: number,
    max: number,
    value: number
}

interface ChartDataParams {
    min: number[],
    max: number[],
    values: number[]
}

function getOptions(data: AnalyzeDetailedInfo[], chartType: ChartType, chartPagePlace: ChartPage) {
    if (ChartType.B_Type === chartType) {
        return getBOption(filterForBChart(data), chartPagePlace);
    } else if (ChartType.T_Type === chartType) {
        return getTOption(filterForTChart(data), chartPagePlace);
    } else if (ChartType.Cytokine_Type === chartType) {
        return getCytokineOption(filterForCytokineChart(data), chartPagePlace);
    } else if (ChartType.Regeneration_Type === chartType) {
        return getRegenerationOption(filterForRegenerationChart(data), chartPagePlace);
    } else if (ChartType.Inflammation_Type === chartType) {
        return getInflammationOption(filterForInflamiationChart(data), chartPagePlace);
    }
    return null;
}


function getBOption(data: ChartDataParams, chartPage: ChartPage) {
    let chartTitle = 'Относительные параметры B - клеточного звена иммунитета'
    let radarIndicator: Indicator[] = [
        { name: 'NEU/CD19' },
        { name: 'NEU/LYMF' },
        { name: 'CD19/CD8' },
        { name: 'CD19/CD4' },
    ]

    let option = getBaseOption(chartTitle, radarIndicator, data, chartPage)
    return option
}

function getTOption(data: ChartDataParams, chartPage: ChartPage) {
    let chartTitle = 'Относительные параметры T - клеточного звена иммунитета'
    let radarIndicator: Indicator[] = [
        { name: 'NEU/CD3' },
        { name: 'NEU/LYMF' },
        { name: 'NEU/CD8' },
        { name: 'NEU/CD4' }
    ]

    let option = getBaseOption(chartTitle, radarIndicator, data, chartPage)
    return option
}

function getCytokineOption(data: ChartDataParams, chartPage: ChartPage) {
    let scale = 1.2;
    let maxValue = Math.max(...data.min, ...data.values, ...data.max);
    let chartTitle = 'Цитокиновые пары';
    let radarIndicator: Indicator[] = [
        { name: 'TNFa', max: maxValue * scale },
        { name: 'IFNy', max: maxValue * scale },
        { name: 'IL2', max: maxValue * scale },
    ];

    let option = getBaseOption(chartTitle, radarIndicator, data, chartPage);
    return option;
}

function getRegenerationOption(data: ChartDataParams, chartPage: ChartPage) {
    let upAxisMaxValue = Math.max(data.min[0], data.values[0], data.max[0]);
    let rightAxisMaxValue = Math.max(data.min[1], data.values[1], data.max[1]);
    let leftAxisMaxValue = Math.max(data.min[2], data.values[2], data.max[2]);

    let chartTitle = 'Расчет вида регенерации';
    let radarIndicator: Indicator[] = [
        { name: 'NEU/MON', max: upAxisMaxValue },
        { name: 'NEU/LYMF', max: rightAxisMaxValue },
        { name: 'LYMF/MON', max: leftAxisMaxValue },
    ];

    let option = getBaseOption(chartTitle, radarIndicator, data, chartPage);
    return option
}

function getInflammationOption(data: ChartDataParams, chartPage: ChartPage) {
    let upAxisMaxValue = Math.max(data.min[0], data.values[0], data.max[0]);
    let leftAxisMaxValue = Math.max(data.min[1], data.values[1], data.max[1]);
    let rightAxisMaxValue = Math.max(data.min[2], data.values[2], data.max[2]);


    let chartTitle = 'Индексы системного воспаления';
    let radarIndicator: Indicator[] = [
        { name: 'SiRi', max: upAxisMaxValue },
        { name: 'Density\n Ne ', max: leftAxisMaxValue },
        { name: 'PiV', max: rightAxisMaxValue }
    ];

    let option = getBaseOption(chartTitle, radarIndicator, data, chartPage);
    return option
}

function getBaseOption(chartTitle: string, indicator: Indicator[], params: ChartDataParams, chartPage: ChartPage) {
    return {
        title: {
            show: false,
            text: chartTitle
        },
        animation: ChartPage.Report === chartPage ? false : true,
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: 0,
            padding: 0,
            data: ChartPage.Report === chartPage
                ? ['Референтные значения', 'Результат', 'true']
                : ['Нижние референтные значения', 'Результат', 'Верхние референтные значения']
        },
        radar: {
            indicator: indicator,
            scale: false,
            silent: true,
            center: ['50%', '55%'],
            axisName: {
                fontWeight: 'bold',
                color: 'black',
                width: 200,
                height: 15,
                margin: 17,
                padding: [10, 0, 10, 0]
            }
        },
        series: [
            {
                tooltip: {
                    trigger: 'item',
                    valueFormatter: (value: any) => value.toFixed(2)
                },
                type: 'radar',
                data: [
                    {
                        label: { show: true, },
                        value: params.min,
                        name: ChartPage.Report === chartPage ? 'Референтные значения' : 'Нижние референтные значения',
                        itemStyle: {
                            color: '#228B22'
                        },
                        lineStyle: {
                            type: 'dashed'
                        },
                    },
                    {
                        label: { show: true, },
                        value: params.max,
                        name: ChartPage.Report === chartPage ? 'Референтные значения' : 'Верхние референтные значения',
                        itemStyle: {
                            color: '#228B22'
                        },
                        lineStyle: {
                            type: 'dashed'
                        },
                    },
                    {
                        label: { show: true, },
                        value: params.values,
                        name: 'Результат',
                        itemStyle: {
                            color: '#DC143C'
                        },
                    }
                ]
            }
        ]
    };
}

function filterForBChart(results: AnalyzeDetailedInfo[]): ChartDataParams {
    let NEU = getValueAndParambyAddName(results, "NEU");
    let LYMF = getValueAndParambyAddName(results, "LYMF");
    let CD4 = getValueAndParambyAddName(results, "CD45+CD3+CD4+");
    let CD19 = getValueAndParambyAddName(results, "CD45+CD19+");
    let CD8 = getValueAndParambyAddName(results, "CD45+CD3+CD8+");

    let CD19divCD4 = divide(CD19, CD4)
    let CD19divCD8 = divide(CD19, CD8)
    let NEUdivCD19 = divide(NEU, CD19)
    let NEUdivLYMF = divide(NEU, LYMF)


    let mins = [NEUdivCD19.min, NEUdivLYMF.min, CD19divCD8.min, CD19divCD4.min];
    let max = [NEUdivCD19.max, NEUdivLYMF.max, CD19divCD8.max, CD19divCD4.max];
    let values = [NEUdivCD19.value, NEUdivLYMF.value, CD19divCD8.value, CD19divCD4.value];

    return {
        min: mins,
        max: max,
        values: values
    }
}

function filterForTChart(results: AnalyzeDetailedInfo[]): ChartDataParams {
    let NEU = getValueAndParambyAddName(results, "NEU");
    let LYMF = getValueAndParambyAddName(results, "LYMF");
    let CD3 = getValueAndParambyAddName(results, "CD45+CD3+");
    let CD4 = getValueAndParambyAddName(results, "CD45+CD3+CD4+");
    let CD8 = getValueAndParambyAddName(results, "CD45+CD3+CD8+");

    let NEUdivCD3 = divide(NEU, CD3)
    let NEUdivCD4 = divide(NEU, CD4)
    let NEUdivCD8 = divide(NEU, CD8)
    let NEUdivLYMF = divide(NEU, LYMF)


    let mins = [NEUdivCD3.min, NEUdivLYMF.min, NEUdivCD8.min, NEUdivCD4.min];
    let max = [NEUdivCD3.max, NEUdivLYMF.max, NEUdivCD8.max, NEUdivCD4.max];
    let values = [NEUdivCD3.value, NEUdivLYMF.value, NEUdivCD8.value, NEUdivCD4.value];

    return {
        min: mins,
        max: max,
        values: values
    }
}

function filterForCytokineChart(results: AnalyzeDetailedInfo[]): ChartDataParams {
    let TNFa_stim = getValueAndParambyId(results, 38);
    let TNFa_spon = getValueAndParambyId(results, 39);
    let fno = divide(TNFa_stim, TNFa_spon);

    let IFNy_stim = getValueAndParambyId(results, 36);
    let IFNy_spon = getValueAndParambyId(results, 37);
    let infer = divide(IFNy_stim, IFNy_spon);

    let IL2_stim = getValueAndParambyId(results, 40);
    let IL2_spon = getValueAndParambyId(results, 41);
    let inlink = divide(IL2_stim, IL2_spon);

    let mins = [80, 80, 80];
    let values = [fno.value, infer.value, inlink.value];
    let max = [120, 120, 120];

    return {
        min: mins,
        max: max,
        values: values
    }
}

function filterForRegenerationChart(results: AnalyzeDetailedInfo[]): ChartDataParams {
    let NEU = getValueAndParambyAddName(results, "NEU");
    let MON = getValueAndParambyAddName(results, "MON");
    let LYMF = getValueAndParambyAddName(results, "LYMF");


    let NEUdivMON = divide(NEU, MON);
    let NEUdivLYMF = divide(NEU, LYMF);
    let LYMFdivMON = divide(LYMF, MON);

    let mins = [6.4, 1.67, 3.4];
    let max = [12.8, 2.1, 6.1];
    let values = [NEUdivMON.value, NEUdivLYMF.value, LYMFdivMON.value];
    return {
        min: mins,
        max: max,
        values: values
    }
}

function filterForInflamiationChart(results: AnalyzeDetailedInfo[]): ChartDataParams {
    let NEU = getValueAndParambyAddName(results, "NEU").value ?? 0;
    let MON = getValueAndParambyAddName(results, "MON").value ?? 0;
    let LYMF = getValueAndParambyAddName(results, "LYMF").value ?? 0;
    let PLT = getValueAndParambyAddName(results, "PLT").value ?? 0;

    let density = roundResult(divideValue(NEU, (LYMF + MON)));
    let SiRi = roundResult(divideValue((NEU * MON), LYMF));
    let PiV = roundResult(divideValue((NEU * MON * PLT), LYMF));

    let mins = [0.25, 1.43, 37.8];
    let max = [1.33, 1.5, 466.67];
    let values = [SiRi, density, PiV];
    return {
        min: mins,
        max: max,
        values: values
    }
}

function getValueAndParambyAddName(results: AnalyzeDetailedInfo[], param: string): ChartDataParam {
    if (results !== null) {
        for (var p of results) {
            if (p.parameter?.additionalName === param)
                return {
                    min: p.parameter.refMin,
                    max: p.parameter.refMax,
                    value: p.value
                }
        }
    }
    return { min: 0, max: 0, value: 0 }
}

function getValueAndParambyId(results: AnalyzeDetailedInfo[], id: number): ChartDataParam {
    if (results !== null) {
        for (var p of results) {
            if (p.parameter?.id === id)
                return {
                    min: p.parameter.refMin,
                    max: p.parameter.refMax,
                    value: p.value
                }
        }
    }
    return { min: 0, max: 0, value: 0 }
}

function divide(first: ChartDataParam, sec: ChartDataParam): ChartDataParam {
    let calcMin = divideValue(first.min, sec.min);
    let val = divideValue(first.value, sec.value);
    let calcMax = divideValue(first.max, sec.max);

    return {
        "min": roundResult(Math.min(calcMin, calcMax)),
        "max": roundResult(Math.max(calcMin, calcMax)),
        "value": roundResult(val)
    }
}

function divideValue(first: number, second: number) {
    return second !== 0 ? (first / second) : 0;
}

function roundResult(val: number) {
    return Math.round(val * 100) / 100
}

export function isGraphFilled(options: any): boolean {
    const nonEmptyItems = options?.series[0]?.data[2]?.value?.filter((value: number) => value > 0);
    return nonEmptyItems.length >= 3;
}

export default getOptions;