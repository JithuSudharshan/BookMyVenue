import venueService from '../services/venueService.js';


export const getVenueById = async (req, res, next) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    res.json({ success: true, venue });
  } catch (error) {
    next(error);
  }
};
