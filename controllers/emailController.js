import Lead from "../models/Lead.js";
import Email from "../models/Email.js";
import {
  findEmail,
  verifyEmail,
} from "../services/emailService.js";
import { sendEmail } from "../services/emailSender.js";

export const findLeadEmail = async (req, res) => {
  try {
    const { leadId } = req.body;

    const lead = await Lead.findOne({
      _id: leadId,
      user: req.user.userId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    let domain = "";

    if (lead.website) {
      try {
        domain = new URL(lead.website)
          .hostname
          .replace("www.", "");
      } catch {
        domain = "";
      }
    }

    const result = await findEmail({
      companyName: lead.companyName,
      domain,
    });

    lead.email = result.email;
    lead.emailStatus = result.status;

    await lead.save();

    res.json({
      success: true,
      message: result.email
        ? "Email found successfully"
        : "Email not found",
      email: result.email,
      status: result.status,
      lead,
    });
  } catch (error) {
    console.error("Email finder error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyLeadEmail = async (req, res) => {
  try {
    const { leadId } = req.body;

    const lead = await Lead.findOne({
      _id: leadId,
      user: req.user.userId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!lead.email) {
      return res.status(400).json({
        success: false,
        message: "No email found for this lead",
      });
    }

    const result = await verifyEmail(lead.email);

    lead.emailStatus = result.status;

    await lead.save();

    res.json({
      success: true,
      message: "Email verification completed",
      email: lead.email,
      status: result.status,
      score: result.score,
      lead,
    });
  } catch (error) {
    console.error("Email verification error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendLeadEmail = async (req, res) => {
  try {
    const {
      leadId,
      subject,
      message,
    } = req.body;

    const lead = await Lead.findOne({
      _id: leadId,
      user: req.user.userId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!lead.email) {
      return res.status(400).json({
        success: false,
        message: "Lead does not have an email",
      });
    }

    const result = await sendEmail({
      to: lead.email,
      subject,
      message,
    });

    const emailHistory = await Email.create({
      user: req.user.userId,
      lead: lead._id,
      to: lead.email,
      subject,
      message,
      status: "sent",
      messageId: result.messageId,
    });

    res.json({
      success: true,
      message: "Email sent successfully",
      email: emailHistory,
    });
  } catch (error) {
    console.error("Send email error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* Email History */
export const getEmailHistory = async (req, res) => {
  try {
    const emails = await Email.find({
      user: req.user.userId,
    })
      .populate("lead", "companyName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      emails,
    });
  } catch (error) {
    console.error("Email history error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmailStats = async (req, res) => {
  try {
    const totalEmailsSent = await Email.countDocuments({
      user: req.user.userId,
      status: "sent",
    });

    res.json({
      success: true,
      stats: {
        totalEmailsSent,
      },
    });
  } catch (error) {
    console.error("Email stats error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};