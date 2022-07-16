export const BulkPaymentDetailsEnity = {
  displayName: "Bulk Payment Details",
  id: "3012",
  url: "BulkPaymentDetailsPage",
  entityName: "BBULKPAYMENTREQUESTDETAILS",
  defaultURL: "PENDINGLIST",
  serviceUrl: "bulkPaymentRequestDetailsService",
  access: ["VIEW", "DATA-ENTRY", "EXECUTE"],
  menuCategory: "Other",
  menuLinksDetail: {
    link: [
      {
        displayName: "Review List",
        url: "/private/getAuthorizedList",
        icon: "checkmark-circle-outline",
        access: "VIEW",
        key: "AUTHORIZEDLIST",
        hide: "N",
      },
      {
        displayName: "Pending Authorization List",
        url: "/private/getPendingList",
        icon: "time",
        access: "VIEW",
        key: "PENDINGLIST",
        hide: "N",
      },
      {
        displayName: "Rejected List",
        url: "/private/getRejectedList",
        icon: "close-circle-outline",
        access: "VIEW",
        key: "REJECTLIST",
        hide: "N",
      },
      /*{
        displayName: "Bank Rejected List",
        url: "/private/getBranchRejectedList",
        icon: "close-circle-outline",
        access: "VIEW",
        key: "BANKREJECTLIST",
        hide: "N",
      },*/
    ],
  },
};
