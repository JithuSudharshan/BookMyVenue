import Venue from '../models/venueModel.js';

class VenueRepository {
  async getVenuesByVendor(vendorId) {
    return await Venue.find({ vendorId }).sort({ createdAt: -1 });
  }

  async getVenueById(venueId) {
    return await Venue.findById(venueId).populate('vendorId', 'name email profileImage');
  }
}

export default new VenueRepository();
