"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faker_1 = require("@faker-js/faker");
const DUMMMY_PLACES = [
    {
        id: "p1",
        creator: "u1",
        description: faker_1.faker.lorem.sentence(),
        location: {
            lat: faker_1.faker.location.latitude(),
            lng: faker_1.faker.location.longitude(),
        },
        title: faker_1.faker.word.noun(),
        address: faker_1.faker.location.secondaryAddress(),
    },
];
const router = (0, express_1.Router)();
router.get("/:placeId", (req, res, next) => {
    const { placeId } = req.params;
    const place = DUMMMY_PLACES.find((place) => place.id === placeId);
    res.json({ place });
});
router.get("/user/:userId", (req, res, next) => {
    const { userId } = req.params;
    const places = DUMMMY_PLACES.filter((place) => place.creator === userId);
    res.json({ places });
});
exports.default = router;
