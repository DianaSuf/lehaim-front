import { FormEvent, useState, useEffect } from "react";
import { GeneDto, Patient, PatientAllGenesDto, PatientGeneDto } from "../../../types/CommonTypes";
import * as patientService from '../../../services/PatientService';
import * as diagnosisService from '../../../services/DiagnosisService';
import * as geneticService from '../../../services/GeneticService';
import { DiagnosisDTO } from "../../../services/DiagnosisService";
import GeneticsInfoBlock from "./GeneticsInfoBlock";
import MultiSelectList from "../../../components/MultipleSelect"

interface Props {
    patient: Patient;
}

function AdditionaInfolBlock({ patient }: Props) {
    const [editMode, setEditMode] = useState(false);
    const [sourcePatient, setSourcePatient] = useState<Patient>(patient);
    const [changePatient, setChangePatient] = useState<Patient>(patient);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [diagnosisId, setDiagnosisId] = useState<number | undefined>(patient.diagnosisId);


    const [diagnosisCatalog, setDiagnosisCatalog] = useState<DiagnosisDTO[]>([]);
    const [patientAllGenes, setPatientAllGenes] = useState<PatientAllGenesDto>();
    const [origPatientDiagnosisGenes, setOrigPatientDiagnosisGenes] = useState<PatientGeneDto[]>([]);
    const [patientDiagnosisGenes, setPatientDiagnosisGenes] = useState<PatientGeneDto[]>([]);
    const [diagnosisGenes, setDiagnosisGenes] = useState<GeneDto[] | undefined>([]);


    useEffect(() => {
        const loadDiagnosisCatalog = async () => {
            setError("");
            setLoading(true);
            try {
                const data = await diagnosisService.loadAllDiagnosis();
                setDiagnosisCatalog(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError("Ошибка: " + err.message);
                } else {
                    setError("Ошибка загрузки: " + err);
                }
            }
            setLoading(false);
        }

        const loadAllPatientGenes = async () => {
            setError("");
            setLoading(true);
            try {
                const data = await geneticService.loadGenesByPatient(patient.id!!)
                setPatientAllGenes(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError("Ошибка: " + err.message);
                } else {
                    setError("Ошибка загрузки: " + err);
                }
            }
            setLoading(false);
        }

        loadDiagnosisCatalog();
        loadAllPatientGenes();
    }, []);

    useEffect(() => {
        const selectedDiagnosis = diagnosisCatalog.find(diag => diag.id === Number(changePatient.diagnosisId));
        setDiagnosisId(selectedDiagnosis?.id);
        setDiagnosisGenes(selectedDiagnosis?.genes);
    }, [diagnosisCatalog, changePatient]);

    useEffect(() => {
        let genesByDiagnosis: PatientGeneDto[] = [];
        if (patientAllGenes && diagnosisId) {
            genesByDiagnosis = patientAllGenes[diagnosisId]
        }
        setPatientDiagnosisGenes(genesByDiagnosis ? genesByDiagnosis : []);
        setOrigPatientDiagnosisGenes(genesByDiagnosis ? genesByDiagnosis : []);
    }, [diagnosisId, patientAllGenes]);

    const toggleEditMode = () => {
        if (editMode) {
            setChangePatient(sourcePatient);
            setPatientDiagnosisGenes(origPatientDiagnosisGenes);
        }
        setEditMode(!editMode);
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setChangePatient(prevData => ({ ...prevData, [name]: value }));
    }

    const handleGeneChange = (changedGene: PatientGeneDto) => {
        const copyGenes = [...patientDiagnosisGenes];

        const updGene = copyGenes.find(gen => gen.geneId == changedGene.geneId);
        if (updGene) {
            updGene.geneValue = changedGene.geneValue;
        } else {
            copyGenes.push({
                geneId: changedGene.geneId,
                geneValue: changedGene.geneValue,
                diagnosisId: diagnosisId!!
            });
        }
        setPatientDiagnosisGenes(copyGenes);
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await patientService.updatePatient(changePatient);
            const geneData = await geneticService.updatePatientGenes(patient.id!!, patientDiagnosisGenes);
            setSourcePatient(data);
            setChangePatient(data);
            setOrigPatientDiagnosisGenes(patientDiagnosisGenes);
            setEditMode(false);
        } catch (err) {
            if (err instanceof Error) {
                setError("Ошибка: " + err.message);
            } else {
                setError("Ошибка сохранения: " + err);
            }
        }
        setLoading(false);
    }

    return (
        <>
            <div className="border border-secondary rounded-3 text-secondary p-3 clearfix">
                <form onSubmit={handleSubmit} className="container-fluid">
                    <div className="row">
                        <label htmlFor="lastNameArea" className="col fw-bold">Фамилия</label>
                        <input className="col"
                            id="lastNameArea"
                            name="lastname"
                            value={changePatient.lastname ?? ""}
                            onChange={handleChange}
                            disabled={!editMode}
                        />
                    </div>
                    <div className="row mt-2">
                        <label htmlFor="nameArea" className="col fw-bold">Имя</label>
                        <input className="col"
                            id="nameArea"
                            name="name"
                            value={changePatient.name ?? ""}
                            onChange={handleChange}
                            disabled={!editMode}
                        />
                    </div>
                    <div className="row mt-2">
                        <label htmlFor="patronymicArea" className="col fw-bold">Отчество</label>
                        <input className="col"
                            id="patronymicArea"
                            name="patronymic"
                            value={changePatient.patronymic ?? ""}
                            onChange={handleChange}
                            disabled={!editMode}
                        />
                    </div>
                    <div className="row mt-2">
                        <label htmlFor="birthDateArea" className="col fw-bold">Дата рождения</label>
                        <input className="col"
                            type="date"
                            min='1900-01-01'
                            max='2199-12-12'
                            id="birthDateArea"
                            name="birthdate"
                            value={changePatient.birthdate}
                            onChange={handleChange}
                            disabled={!editMode}
                        />
                    </div>

                    <div className="mb-3 mt-2">
                        <label htmlFor="mainDiagnosisArea"
                            className="fw-bold">Диагноз:</label>
                        <div className="mt-2">
                            <select
                                id="mainDiagnosisArea"
                                disabled={!editMode}
                                name="diagnosisId"
                                className="container-fluid"
                                value={changePatient.diagnosisId ?? ""}
                                onChange={handleChange}>
                                {!sourcePatient.diagnosisId &&
                                    <option>-</option>
                                }
                                {diagnosisCatalog?.map((diag) =>
                                    <option value={diag.id} key={diag.id}>
                                        {diag.code + " - " + diag.description}
                                    </option>
                                )}
                            </select>
                        </div>

                    </div>

                    <div className="mb-3 d-flex">
                        <div  className="me-3">
                            <label htmlFor="TArea"
                                className="fw-bold me-3">T:</label>
                            <select
                                id="TArea"
                                disabled={!editMode}
                                name="t"
                                value={changePatient.t ?? ""}
                                onChange={handleChange}>
                                <option value="">-</option>
                                <option value="0">0</option>
                                <option value="X">Х</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>

                        <div className="me-3">
                            <label htmlFor="NArea"
                                className="fw-bold me-3">N:</label>
                            <select
                                id="NArea"
                                disabled={!editMode}
                                name="n"
                                value={changePatient.n ?? ""}
                                onChange={handleChange}>
                                <option value="">-</option>
                                <option value="0">0</option>
                                <option value="X">Х</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3 d-flex"><MultiSelectList
                        label="M:"
                        options={["0", "X", "1", "1 Hep", "1 Pul", "1 OSS"]}
                        value={changePatient.m ?? ""}
                        onChange={(newValue) => setChangePatient(prevData => ({ ...prevData, m: newValue }))}
                        disabled={!editMode}
                    /></div>

                    <GeneticsInfoBlock
                        genesList={diagnosisGenes}
                        patientGenes={patientDiagnosisGenes}
                        isEditMode={editMode}

                        onChange={handleGeneChange} />

                    <div className="mb-3">
                        <label htmlFor="operationDate" className="fw-bold">Дата операции:</label>
                        <div className="mt-2">
                            <input className="w-100"
                                type="date"
                                min='1900-01-01'
                                max='2199-12-12'
                                id="operationDateArea"
                                name="operationDate"
                                autoComplete="off"
                                value={changePatient.operationDate ?? ""}
                                onChange={handleChange}
                                disabled={!editMode} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="diagnosisArea"
                            className="fw-bold">Комментарий о диагнозе:</label>
                        <div className="mt-2">
                            <textarea className="w-100"
                                id="diagnosisArea"
                                name="diagnosisComments"
                                value={changePatient.diagnosisComments ?? ""}
                                onChange={handleChange}
                                disabled={!editMode} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="surgeryArea" className="fw-bold">Комментарий об операции:</label>
                        <div className="mt-2">
                            <textarea
                                className="w-100"
                                id="surgeryArea"
                                name="operationComments"
                                value={changePatient.operationComments ?? ""}
                                onChange={handleChange}
                                disabled={!editMode} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="therapyArea" className="fw-bold">Комментарий о курсах химиотерапии:</label>
                        <div className="mt-2">
                            <textarea
                                className="w-100"
                                id="therapyArea"
                                name="chemotherapyComments"
                                value={changePatient.chemotherapyComments ?? ""}
                                onChange={handleChange}
                                disabled={!editMode} />
                        </div>
                    </div>
                    {error &&
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    }
                    <div className="d-flex justify-content-end mt-3">
                        {editMode &&
                            <button type="submit"
                                className="btn btn-outline-success float-end"
                                disabled={loading}
                                title="Сохранить изменения">
                                {loading &&
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                }
                                Сохранить
                            </button>
                        }
                        <button
                            type="button"
                            onClick={toggleEditMode}
                            className="btn btn-outline-secondary ms-3 float-end"
                            disabled={loading}
                            title={editMode ? "Отмена изменений" : "Редактировать сведения"}
                        >
                            {editMode ? "Отмена" : "Редактировать"}
                        </button>
                    </div>
                </form>
            </div>
        </>

    );
}

export default AdditionaInfolBlock;