export const billPaymentDetailsEntity = {
  displayName: "Bill Payment Details",
  id: "3012",
  url: "BillPaymentUploadPendingListingPage",
  entityName: "BILLPAYMENTUPLOADDET",
  defaultURL: "PENDINGLIST",
  serviceUrl: "billPaymentUploadService",
  access: ["VIEW", "DATA-ENTRY", "EXECUTE"],
  menuCategory: "Other",
  menuLinksDetail: {
    link: [
      {
        displayName: "Review List",
        url: "/private/getReviewDetails",
        icon: "checkmark-circle-outline",
        access: "VIEW",
        key: "AUTHORIZEDLIST",
        hide: "N",
      },
      {
        displayName: "Pending Authorization List",
        url: "/private/getReviewDetails",
        icon: "time",
        access: "VIEW",
        key: "PENDINGLIST",
        hide: "N",
      },
      {
        displayName: "Rejected List",
        url: "/private/getReviewDetails",
        icon: "close-circle-outline",
        access: "VIEW",
        key: "REJECTLIST",
        hide: "N",
      }
    ],
  },
};
