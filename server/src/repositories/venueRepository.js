import Venue from '../models/Venue.js';

class VenueRepository {
  async getVenuesByVendor(vendorId) {
    return await Venue.find({ vendorId }).sort({ createdAt: -1 });
  }

  async getVenueById(venueId) {
    return await Venue.findById(venueId);
  }
}

export default new VenueRepository();
