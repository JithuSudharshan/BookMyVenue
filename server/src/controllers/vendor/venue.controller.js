import * as venueService from '../../services/vendor/venue.service.js';

export const createVenue = async (req, res) => {
    try {
        // Assuming vendor authentication middleware attaches vendor ID to req.user
        const vendorId = req.user?.id || req.body.vendorId; // Fallback for testing without auth
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
        const venues = await venueService.getVendorVenuesService(vendorId);
        
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
