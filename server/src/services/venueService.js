import venueRepository from '../repositories/venueRepository.js';

class VenueService {
  async getVenuesByVendor(vendorUserId) {
    return await venueRepository.getVenuesByVendor(vendorUserId);
  }

  async getVenueById(venueId) {
    const venue = await venueRepository.getVenueById(venueId);
    if (!venue) {
      const err = new Error('Venue not found');
      err.statusCode = 404;
      throw err;
    }
    return venue;
  }
}

export default new VenueService();
