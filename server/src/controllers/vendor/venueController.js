import * as venueService from '../../services/vendor/venueService.js';

export const createVenue = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId; 
        const venue = await venueService.createVenueService(vendorId, req.body);
        
        res.status(201).json({
            success: true,
            message: "Venue created successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getVenueById = async (req, res) => {
    if (req.query.action === 'continue') {
        return continueDraft(req, res);
    }
    
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.getVenueByIdService(vendorId, id);
        
        res.status(200).json({
            success: true,
            message: "Venue retrieved successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getVendorVenues = async (req, res) => {

    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const venues = await venueService.getVendorVenuesService(vendorId, req.query);
        
        res.status(200).json({
            success: true,
            message: "Venues retrieved successfully",
            data: venues
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const updateVenue = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.updateVenueService(vendorId, id, req.body);
        
        res.status(200).json({
            success: true,
            message: "Venue updated successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const submitVenue = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.submitVenueService(vendorId, id);
        
        res.status(200).json({
            success: true,
            message: "Venue submitted for review successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const blockVenue = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.blockVenueService(vendorId, id);
        
        res.status(200).json({
            success: true,
            message: "Venue blocked successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const unblockVenue = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.unblockVenueService(vendorId, id);
        
        res.status(200).json({
            success: true,
            message: "Venue unblocked successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const saveDraft = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        
        const venue = await venueService.saveDraft(vendorId, id, req.body);
        
        res.status(id ? 200 : 201).json({
            success: true,
            message: "Draft saved successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getDrafts = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const drafts = await venueService.getDrafts(vendorId);
        
        res.status(200).json({
            success: true,
            message: "Drafts retrieved successfully",
            data: drafts
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const continueDraft = async (req, res) => {
    try {
        const vendorId = req.user?.id || req.body.vendorId;
        const { id } = req.params;
        const venue = await venueService.continueDraft(vendorId, id);
        
        res.status(200).json({
            success: true,
            message: "Draft loaded successfully",
            data: venue
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};
