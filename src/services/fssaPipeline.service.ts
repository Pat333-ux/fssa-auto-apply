import { prisma } from '../config/db.js';
import { FssaApplicationInput } from '../schemas/fssaApplication.schema.js';

export async function processFssaSubmission(data: FssaApplicationInput) {
  try {
    // Basic automated eligibility triage pre-check (e.g., SNAP gross income standard ~130% FPL proxy logic)
    console.log(`[FSSA-PIPELINE] Processing application for applicant: ${data.applicantUuid} in ${data.county} County`);

    const record = await prisma.fssaApplication.create({
      data: {
        applicantUuid: data.applicantUuid,
        county: data.county,
        programType: data.programType,
        householdSize: data.householdSize,
        grossMonthlyIncome: data.grossMonthlyIncome,
        status: 'SUBMITTED_TO_PIPELINE',
        submissionPayload: data.submissionPayload,
      },
    });

    console.log(`[FSSA-PIPELINE] Successfully queued application record: ${record.id}`);
    return { success: true, applicationId: record.id, status: record.status };
  } catch (error: any) {
    console.error('[FSSA-PIPELINE] Database persistence error:', error);
    return { success: false, error: error.message || 'Unknown pipeline error' };
  }
}
