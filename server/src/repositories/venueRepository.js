import Venue from '../models/venueModel.js';
import Vendor from '../models/vendorModel.js';

class VenueRepository {
  async getVenuesByVendor(vendorId) {
    return await Venue.find({ vendorId }).sort({ createdAt: -1 });
  }

  async getVenueById(venueId) {
    const venue = await Venue.findById(venueId).populate('vendorId', 'email createdAt').lean();
    if (venue && venue.vendorId && venue.vendorId._id) {
      const vendorProfile = await Vendor.findOne({ userId: venue.vendorId._id }, 'fullName firstName profileImage').lean();
      venue.vendorId.profile = vendorProfile || null;
    }
    return venue;
  }
}

export default new VenueRepository();
