export interface LeasingSummaryModel {
    responseStatus: ResponseStatus;
    totalArrears: string;
    noOfAgreements: string;
    leasingSummaryHeaders?: (string)[] | null;
    leasingSummaryDetails?: (LeasingSummaryDetailsModel)[] | null;
    loggable: boolean;
    entityIdentifier: string;
}
export interface ResponseStatus {
    message: string;
    status: string;
}
export interface LeasingSummaryDetailsModel {
    responseStatus: ResponseStatus;
    agreementNo: string;
    vehicalNo: string;
    rentalValue: string;
    totalArrears: string;
    loggable: boolean;
    entityIdentifier: string;
    nextDueDate?: string | null;
}
