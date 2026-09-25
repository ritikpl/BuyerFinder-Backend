import Lead from "../models/Lead.js";
import { searchBusinesses } from "../services/businessService.js";

export const searchLeads = async (req, res) => {
  try {
    const {
      category = "Home Decor",
      city = "",
      state = "",
      keyword = "",
      limit = 5,
    } = req.body;

    const businesses = await searchBusinesses({
      category,
      city,
      state,
      keyword,
      limit,
    });

    const leads = [];

    for (const business of businesses) {
      let lead = await Lead.findOne({
        user: req.user.userId,
        placeId: business.placeId,
      });

      if (!lead) {
        lead = await Lead.create({
          user: req.user.userId,
          ...business,
        });
      }

      leads.push(lead);
    }

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Search leads error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      user: req.user.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getSavedLeads = async (req, res) => {
  try {
    const leads = await Lead.find({
      user: req.user.userId,
      isSaved: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleSaveLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.isSaved = !lead.isSaved;
    await lead.save();

    res.json({
      success: true,
      message: lead.isSaved ? "Lead saved" : "Lead removed",
      lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const totalLeads = await Lead.countDocuments({
      user: userId,
    });

    const savedLeads = await Lead.countDocuments({
      user: userId,
      isSaved: true,
    });

    const verifiedEmails = await Lead.countDocuments({
      user: userId,
      emailStatus: "valid",
    });

    res.json({
      success: true,
      stats: {
        totalLeads,
        savedLeads,
        verifiedEmails,
      },
    });
  } catch (error) {
    console.error("Lead stats error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};