import venueService from '../services/venueService.js';

export const getMyVenues = async (req, res, next) => {
  try {
    const venues = await venueService.getVenuesByVendor(req.user._id);
    res.json({ success: true, venues });
  } catch (error) {
    next(error);
  }
};

export const getVenueById = async (req, res, next) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    res.json({ success: true, venue });
  } catch (error) {
    next(error);
  }
};
