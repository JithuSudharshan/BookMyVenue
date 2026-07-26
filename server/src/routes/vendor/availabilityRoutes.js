import express from 'express';
import * as slotController from '../../controllers/vendor/slotManagementController.js';

const router = express.Router({ mergeParams: true });
router.get('/',              slotController.getMonthOverview);
router.get('/date',          slotController.getDateAvailability);
router.post('/block/daily',  slotController.blockDailySlots);
router.post('/block/hourly', slotController.blockHourlySlot);
router.delete('/override',   slotController.removeOverride);
router.patch('/acknowledge', slotController.acknowledgeSlots);

export default router;
