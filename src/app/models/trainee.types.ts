export interface TestResult {
    id: string;
    traineeId: string;
    traineeName: string;
    subject: string;
    grade: number;
    date: string; // ISO yyyy-mm-dd
}

export interface Trainee {
    traineeId: string;
    name: string;
    email?: string;
}
