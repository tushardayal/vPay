export enum TxnEnquiryType {
  ENQUIRY = 'ENQUIRY', SUMMARY = 'SUMMARY'
}
export class TransactionDataListMapping {
  // Please Note in enquiry object values are not used only key(match with methodName) are used for showing help pages
  private enquiryObj = {
    LETTEROFCREDIT: {
      enquiry: {
        TransactionRefNo: "uerRefNo",
        LcApplicantName: "applicantName",
        IssueDate: "issueDate",
        lCNo: "lcNo",
        LcCurrencyCode: "currency",
        Amount: "amount",
        LcBeneficiaryName: "beneficiaryName",
        ExpiryDate: "expiryDate"
      },
      summary: {
        "User Ref No.": "userRefNo",
        "Applicant Name": "applicantName",
        "Date and Time": "dateTime",
        // RefId: 'refId',
        Currency: 'currency',
        "LC Amount": 'lcAmount',
        "Beneficiary Name": "beneficiayName",
        // "LC No": "lcNo",
        // "Issue Date": "issueDate",
        // Status: 'status'
      },
    },
    LETTEROFCREDITAMEND: {
      enquiry: {
        TransactionRefNumber: "userRefNo",
        LcAmendApplicantName: "applicantName",
        IssuanceDate: "issueDate",
        LcNumber: "lcNo",
        CurrencyCode: "currency",
        Amount: "amount",
        LcAmendBeneficiaryName: "beneficiaryName",
        ExpiryDate: "expiryDate",
        NoOfAmendment: "noOfAmend"
      },
      summary: {
        "User Ref No.": "userRefNo",
        Applicant: "applicantName",
        "Date and Time": "dateTime",
        // RefId: 'refId',
        Currency: 'currency',
        "LC Amount": 'amount',
        Beneficiary: "beneficiayName",
        // Status: 'status'
      },
    },
    SHIPPINGGUARANTEE: {
      enquiry: {
        TransactionRefNum: "userRefNo",
        SgApplicantName: "applicantName",
        SgNo: "sgNo",
        CurrencyCode: "currency",
        SgAmount: "amount",
        LcBeneficiaryName: "beneficiaryName",
        LcNo: "lcNo"
      },
      summary: {
        "User Ref No.": "userRefNo",
        "Date and Time": "dateTime",
        Applicant: "applicantName",
        Beneficiary: "beneficiayName",
        "SG Amount": 'amount',
        RefId: 'refId',
        Currency: 'currency',
        Status: 'status'
      },
    },
    TRADEBILLACCEPTANCE: {
      enquiry: {
        BillTransactionRefNo: "userRefNo",
        Exporter: "exporter",
        TradeBillDate: "billDate",
        TradeBillNo: "tradeBillNo",
        BillAccepted: "accepted",
        CurrencyCode: "currency",
        BillAmount: "amount",
        Importer: "importer",
        TradeBillDueDate: "billDueDate",
        LcNo: "lcNo"
      },
      summary: {
        "User Ref No.": "userRefNo",
        Exporter: "exporterName",
        "Date and Time": "dateTime",
        // RefId: 'refId',
        Currency: 'currency',
        Amount: 'amount',
        Importer: "importerName",
        // Status: 'status'
      },
    },
    TRADEBILLPAYMENTREQUEST: {
      enquiry: {
        BillTransactionRefNo: "userRefNo",
        Exporter: "exporter",
        TradeBillDate: "billDate",
        TradeBillNo: "tradeBillNo",
        LcNo: "lcNo",
        CurrencyCode: "currency",
        BillAmount: "amount",
        Importer: "importer",
        TradeBillDueDate: "billDueDate",
        dAdp: "dadp"
      },
      summary: {
        "User Ref No.": "userRefNo",
        Exporter: "exporterName",
        "Date and Time": "dateTime",
        // RefId: 'refId',
        Currency: 'currency',
        Amount: 'amount',
        Importer: "importerName",
        // "LC No.": "lcNo",
        "LC Number.": "lcNo",
        // Status: 'status'
      },
    },
    OTT: {
      enquiry: {
        BatchNo: "userRefNo",
        ApplicantName: "applicantName",
        ProformaInvoiceNo: "proformaInvoiceNumber",
        PayableCurrencyName: "currency",
        PayableAmount: "amount",
        BeneficiaryName: "beneficiaryName"
      },
      summary: {
        "User Ref No": 'userRefNo',
        Applicant: "applicantName",
        "Date and Time": "dateTime",
        // RefId: 'refId',
        Currency: 'currency',
        Amount: 'amount',
        Beneficiary: "beneficiaryName",
        "Proforma Invoice Number": "proformaInvoiceNumber",
        // Status: 'status'
      },
    },
    IMPORTREQUESTFINANCE: {
      enquiry: {
        UserRefNo: "userRefNo",
        PurposeCode: "purposeCode",
        // InterestRate: "interest",
        LoanCurrencyCode: "loanCurrency",
        LoanAmount: "loanAmount",
        ApplicantName: "applicantName",
        TenureInDays: "tenorInDays",
      },
      summary: {
        "User Ref No": 'userRefNo',
        "Purpose Code": "purposeCode",
        "Date and Time": "dateTime",
        "Loan Currency": "loanCurrency",
        "Loan Amount": "loanAmount",
        Applicant: 'applicantName',
        // RefId: 'refId',
        // Status: 'status'
      },
    },
    BANKGUARANTEE: {
      enquiry: {
        TransactionRefNum: "userRefNo",
        BgBeneficiaryName: "importer",
        IssueDate: "issuingDate",
        BgNo: "bgNo",
        CurrencyCode: "currency",
        BgAmount: "amount",
        BgApplicantName: "applicantName",
        ExpiryDate: "expiryDate"
      },
      summary: {
        "User Ref No.": 'userRefNo',
        Applicant: 'applicantName',
        // RefId: 'refId',
        "Date and Time": 'dateTime',
        Currency: 'currency',
        Amount: 'amount',
        Beneficiary: 'importerName',
        // Status: 'status'
      },
    },
    BANKGUARANTEEAMEND: {
      enquiry: {
        TransactionRefNum: "userRefNo",
        BgApplicantName: "applicantName",
        BgRefNo: "bgNo",
        IssueDate: "issuingDate",
        CurrencyCode: "currency",
        BgAmount: "amount",
        BgBeneficiaryName: "importer",
        NoOfAmendMents: "noOfAmendments",
        ExpiryDate: "expiryDate"
      },
      summary: {
        "User Ref No.": "userRefNo",
        Applicant: "applicantName",
        "Date and Time": 'dateTime',
        Currency: "currency",
        Amount: "amount",
        Beneficiary: "importerName",
        // "Last Action": 'lastAction',
        // "Performed BY": 'performedBy',
      },
    },
    EXPORTREQUESTFINANCE: {
      enquiry: {
        UserRefNo: "userRefNo",
        ApplicantName: "applicantName",
        LcNumber: "lcNo",
        InvoiceNumber: "invoiceNumber",
        LoanCurrencyCode: "loanCurrency",
        LoanAmount: "loanAmount",
        BuyerDisplayName: "importer",
        TenureInDays: "tenorInDays",
      },
      summary: {
        "User Ref No": 'userRefNo',
        Applicant: 'applicantName',
        "Date and Time": 'dateTime',
        Currency: 'currency',
        Amount: 'amount',
        Importer: 'importerName',
        // RefId: 'refId',
        // Status: 'status'
      },
    },
    TRADEBILLPRESENTMENT: {
      enquiry: {
        TransactionRefNo: "userRefNo",
        LcNumber: "lcNo",
        InvoiceNumber: "billNo",
        // "Due Date": "dueDate",
        TradeBillCurrencyCode: "currency",
        TradeBillDisplayAmount: "amount",
        ImporterName: "importer",
        // Applicant: "applicantName",
        BillDate: "billDate",
      },
      summary: {
        "User Ref No": 'userRefNo',
        Applicant: 'applicantName',
        "Date and Time": 'dateTime',
        // RefId: 'refId',
        Currency: 'currency',
        Amount: 'amount',
        Importer: 'importerName',
        // Status: 'status'
      },
    },
  };
  selectedTransHeaders: any = {};
  translatePipe;
  type: TxnEnquiryType;

  constructor(entityName, type: TxnEnquiryType, translatePipe) {
    this.type = type;
    if (this.type === TxnEnquiryType.ENQUIRY) {
      this.selectedTransHeaders = this.enquiryObj[entityName].enquiry;
    }
    if (this.type === TxnEnquiryType.SUMMARY) {
      this.selectedTransHeaders = this.enquiryObj[entityName].summary;
    }
    this.translatePipe = translatePipe;
  }

  setListingHeaders(dataItem, item) {
    // tslint:disable-next-line: forin
    for (const key in this.selectedTransHeaders) {
      const newKey = this.selectedTransHeaders[key];
      item[newKey] = dataItem[key] ? dataItem[key] : '-';
    }
  }

  getHelpPageLabels(headers: any[]) {
    const labelList = [];
    // tslint:disable-next-line: forin
    for (const key in this.selectedTransHeaders) {
      if (this.type === TxnEnquiryType.ENQUIRY) {
        try {
          labelList.push({
            name: headers.find(a => a.methodName === key).methodName,
            text: headers.find(a => a.methodName === key).displayName
          });
        } catch (e) {
          console.warn(key, e);
        }
      } else {
        labelList.push({
          name: this.selectedTransHeaders[key],
          text: this.translatePipe.transform(key)
        });
      }
    }
    return labelList;
  }
}
