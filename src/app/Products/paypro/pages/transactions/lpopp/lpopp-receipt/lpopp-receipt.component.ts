import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {AngularAjaxService} from "../../../../../../services/aps-services/ajaxService/angular-ajax.service";
import {ModalController, Platform} from "@ionic/angular";
import {environment} from "../../../../../../../environments/environment";
import {PrintingService} from "../../../../../../services/printing.service";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {ActivatedRoute} from "@angular/router";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-lpopp-receipt',
    templateUrl: './lpopp-receipt.component.html',
    styleUrls: ['./lpopp-receipt.component.scss'],
})
export class LpoppReceiptComponent implements OnInit, OnDestroy {
    @ViewChild('printEl', {static: false}) printEl: ElementRef;
    id;
    GET_RECEIPT = 'paypro/lpoppRequestService/private/getReceipt';
    unsub$ = new Subject();
    receiptDataResponse;
    environment = environment;
    bankLogoImg = `./assets/imgs/${environment.themeCategory}/bank_cfe_bankLogo.png`;
    headerData = [
        // {image: {} }, // width: 100}
        {text: '', margin: [0, 10, 0, 0]},
        {text: 'Nations Direct Enterprise Payment Advice', style: 'header'},
        {text: '', margin: [0, 2, 0, 20]}
    ];
    footerData = [
        {text: '', margin: [0, 35, 0, 0]},
        {table: {headerRows: 1, widths: '100%', body: [[''], ['']]}, layout: 'headerLineOnly'},
        {text: '', margin: [0, 10, 0, 0]},
        {text: 'Nations Trust Bank PLC-PQ118', style: 'footerData'},
        {text: 'No/ 242, Union Place, Colombo 02, Sri Lanka', style: 'footerData'},
        {
            text: 'This is a computer-generated advice, no signature required',
            style: 'footerData',
            margin: [0, 20, 0, 0]
        },
        {table: {headerRows: 1, widths: '100%', body: [[''], ['']]}, layout: 'headerLineOnly'},
        {text: '', pageBreak: 'after'},
    ];
    pdfData: any;
    pdfObj: any;
    logoData;
    // tslint:disable-next-line:max-line-length
    epfMsg = 'Please be informed that EPF payments processed successfully after 10PM on bank working days and EPF payment processed successfully on Saturdays, Sundays and Bank/Public Holidays will be considered as next working day\'s payment.';
    epfCutOffLbl = 'Payment Cutoff Notice';
    commonFeilds = [
        {id: 'paidBy', displayName: 'Paid By'},
        {
            id: 'customerbankName',
            displayName: 'Bank & Account No',
            extraData: this.setExtraData,
            extraId: 'customerAccNo'
        },
        {id: 'paidTo', displayName: 'Paid to'},
        {
            id: 'instituteBankName', displayName: 'Bank & Account No',
            extraData: this.setExtraData,
            extraId: 'instituteAccNo'
        },
        {id: 'paymentMethod', displayName: 'Payment Method'},
        {id: 'paymentDate', displayName: 'Payment Date'},
        {id: 'receiptStatus', displayName: 'Payment Status'},
    ];
    irdpFeilds = [
        {id: 'paymentAmountType', displayName: 'Payment Amount Type'},
        {id: 'amount', displayName: 'Amount'},
        {id: 'batchNo', displayName: 'NDE Batch No'},
        {id: 'paymentType', displayName: 'Payment Type'},
        {id: 'din', displayName: 'DIN'},
        {id: 'taxType', displayName: 'Tax Type'},
        {id: 'taxablePeriod', displayName: 'Tax Period'},
        {id: 'acknowledgementNo', displayName: 'Acknowledgement NO'},
        {id: 'stanCode', displayName: 'STAN'},
    ];
    slpapFeilds = [
        {id: 'billType', displayName: 'Bill Type'},
        {id: 'amount', displayName: 'Amount'},
        {id: 'batchNo', displayName: 'NDE Batch No'},
        {id: 'paymentsType', displayName: 'Payment Type'},
        {id: 'agentCode', displayName: 'Agent Code'},
        {id: 'vesselReferenceNo', displayName: 'Vessel Reference'},
        {id: 'receiptNo', displayName: 'Receipt No'},
    ];
    epfpFeilds = [
        {id: 'amount', displayName: 'Amount'},
        {id: 'batchNo', displayName: 'NDE Batch No'},
        {id: 'zoneCode', displayName: 'Zone Code'},
        {id: 'employerNumber', displayName: 'Employer No'},
        {id: 'contributionPeriod', displayName: 'Contribution Period'},
        {id: 'submissionNumber', displayName: 'Submission Number'},
        {id: 'paymentReferenceNo', displayName: 'Payment Reference'},
    ];
    slcpFeilds = [
        {id: 'amount', displayName: 'Amount'},
        {id: 'batchNo', displayName: 'NDE Batch No'},
        {id: 'receiptNo', displayName: 'Receipt No'},
        {id: 'receiptDate', displayName: 'Receipt Date'},
        {id: '', displayName: 'CusDec Details'},
        {id: 'officeCode', displayName: 'Office Code'},
        {id: 'registrationYear', displayName: 'Registration Year'},
        {id: 'registrationSerial', displayName: 'Registration Serial'},
        {id: 'registrationNo', displayName: 'Registration No'},
    ];
    lpoppReceipts: any;
    private receiptDataListForPdf: any;

    constructor(private ajaxService: AngularAjaxService,
                private printService: PrintingService,
                private platform: Platform,
                private activeRoute: ActivatedRoute,
                private modalCtrl: ModalController) {
        activeRoute.paramMap
            .pipe(takeUntil(this.unsub$))
            .subscribe((val) => {
                this.id = val.get("id");
            });
    }

    setExtraData(data, key) {
        return `[${data[key]}]`;
    }

    ngOnInit() {
        this.getReceipt(this.id);
        this.ajaxService.get(this.bankLogoImg, {}, {responseType: 'blob'})
            .subscribe((data) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    this.logoData = reader.result;
                    // @ts-ignore
                    this.headerData.unshift({image: this.logoData});
                };
                // @ts-ignore
                reader.readAsDataURL(data);
            });
    }

    ngOnDestroy(): void {
        console.log('ngOnDestroy' + 'receipt');
        this.unsub$.next();
        this.unsub$.complete();
        this.unsub$.unsubscribe();
    }

    closeModal() {
        // this.modalCtrl.getTop();
        this.modalCtrl.dismiss({}, '', 'lpopp-receipt');
    }

    printPage() {
        console.log('printPage');
        try {
            this.createPdfData();
            const filename = `NDE_Nations Trust Bank_LPOPP_${Date.now().toString()}.pdf`;
            this.printService.print(this.pdfObj, filename);

        } catch (e) {
            console.log(e);
        }

    }

    addCutOfMsg(currentFeildsData, receiptType) {
        if (receiptType === 'epfpFeilds') {
            const receiptObjLbl = {
                style: 'receiptData',
                columns: [
                    {width: '100%', text: this.epfCutOffLbl, margin: [0, 20, 0, 10], decoration: 'underline'},
                    // {width: '10%', text: ':'},
                    // {text: ''}
                ],
                columnGap: 3
            };
            const receiptObjMsg = {
                style: 'receiptData',
                columns: [
                    {width: '100%', text: this.epfMsg},
                    // {width: '10%', text: ':'},
                    // {text: ''}
                ],
                columnGap: 3
            };
            currentFeildsData.push([receiptObjLbl]);
            currentFeildsData.push([receiptObjMsg]);
        }
    }

    setDataAsPerType(receiptData, feilds) {
        const receiptFieldData = [];
        for (const field of feilds) {

            let val = receiptData[field.id];
            if (field.extraData) {
                val = val + ' ' + field.extraData(receiptData, field.extraId);
            }
            const receiptObj = {
                style: 'receiptData',
                columns: [
                    {width: '30%', text: field.displayName},
                    {width: '10%', text: ':'},
                    {text: val}
                ],
                // optional space between columns
                columnGap: 3
            };
            receiptFieldData.push([receiptObj, {text: '', margin: [0, 10, 0, 0]}]);
        }
        return receiptFieldData;
    }

    createPdfData() {
        let docDefinition = {};
        const data = this.getPdfData();

        docDefinition = {
            background(currentPage, pageSize) {
                return [
                    {
                        canvas: [
                            {type: 'line', x1: 5, y1: 5, x2: 590, y2: 5, lineWidth: 1, color: '#808080'}, // Up line
                            {type: 'line', x1: 5, y1: 5, x2: 5, y2: 835, lineWidth: 1, color: '#808080'}, // Left line
                            {type: 'line', x1: 5, y1: 835, x2: 590, y2: 835, lineWidth: 1, color: '#808080'}, // Bottom line
                            {type: 'line', x1: 590, y1: 5, x2: 590, y2: 835, lineWidth: 1, color: '#808080'}, // Rigth line
                        ]

                    }
                ];
            },
            ...data
        };
        console.log('pdfData', docDefinition);
        this.pdfObj = pdfMake.createPdf(docDefinition);
    }

    private getReceipt(id: string) {
        // this.pdfData = {};
        // this.receiptData = {};
        // $scope.listingObj.viewReceiptPage = "";
        // $scope.listingObj.receiptType = "";
        const data = {dataMap: {id}};

        this.ajaxService.sendAjaxRequest(this.GET_RECEIPT, data)
            .pipe(takeUntil(this.unsub$))
            .subscribe((response) => {
                this.receiptDataResponse = response;
                this.lpoppReceipts = this.receiptDataResponse.lpoppReceipts;
                this.generatePdfData();
            });
    }

    private generatePdfData() {
        this.receiptDataListForPdf = [];
        const receiptType = this.receiptDataResponse.receiptType.toLowerCase() + 'Feilds';
        console.log('respType', receiptType);
        console.log('respType Feilds', this[receiptType]);
        const currentFeilds = this[receiptType];
        for (const receipt of this.lpoppReceipts) {
            let commonFeildsData = [];
            let currentFeildsData = [];
            commonFeildsData = this.setDataAsPerType(receipt, this.commonFeilds);
            currentFeildsData = this.setDataAsPerType(receipt, currentFeilds);
            this.addCutOfMsg(currentFeildsData, receiptType);
            const receiptData = [...commonFeildsData, ...currentFeildsData];
            this.receiptDataListForPdf.push(receiptData);
        }
    }

    private getPdfData() {
        const contentData = [];
        for (const receiptData of this.receiptDataListForPdf) {
            contentData.push([...this.headerData], [...receiptData], [...this.footerData]);
        }
        contentData[contentData.length - 1].pop(); // Remove last page break;
        let data = {
            content: [...contentData],
            styles: {header: {fontSize: 15, bold: true}, receiptData: {fontSize: 8}, footerData: {fontSize: 8}}
        };
        data = JSON.parse(JSON.stringify(data));
        return data;
    }
}
