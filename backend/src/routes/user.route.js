import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getRecommendedUsers, sendFriendRequest, acceptFriendRequest, getMyFriends, getFriendRequests, getOutgoingFriendReqs} from '../controllers/user.controller.js';
const router = express.Router();

router.use(protectRoute);

// apply auth middelwar to all routes
router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);

router.post('/friend-request/:id', sendFriendRequest);
router.post('/friend-request/:id/accept', acceptFriendRequest);

router.get('/friend-requests',getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;


