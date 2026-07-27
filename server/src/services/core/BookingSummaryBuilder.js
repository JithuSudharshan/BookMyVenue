/**
 * BookingSummaryBuilder.js
 * Presentation layer to format business logic into UI-ready data.
 */

export const buildBookingSummary = (pricingData, policyData) => {
  const summary = {
    ...pricingData,
    ...policyData,
    ui: {
      userMessage: '',
      userMessageSub: '',
      paymentTimeline: []
    }
  };

  if (policyData.paymentPolicy === 'advance_payment') {
    summary.ui.userMessage = `Pay Today (${policyData.policyMetadata.advancePercentage}% Advance): ₹${policyData.advanceAmount.toLocaleString('en-IN')}`;
    summary.ui.userMessageSub = `Remaining Balance: ₹${policyData.remainingAmount.toLocaleString('en-IN')}`;
    
    const dueDateStr = policyData.balanceDueDate.toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });

    summary.ui.paymentTimeline = [
      { step: 'Today', text: 'Advance', status: 'current' },
      { step: dueDateStr, text: 'Balance Due', status: 'pending' }
    ];
  } else {
    summary.ui.userMessage = `Today's Payment (100%): ₹${pricingData.totalAmount.toLocaleString('en-IN')}`;
    summary.ui.userMessageSub = `Full payment is required for this booking.`;
    
    summary.ui.paymentTimeline = [
      { step: 'Today', text: 'Fully Paid', status: 'current' }
    ];
  }

  return summary;
};
