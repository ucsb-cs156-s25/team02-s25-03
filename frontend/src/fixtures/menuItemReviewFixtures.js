const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 27,
    reviewerEmail: "cgaucho@ucsb.edu",
    stars: 3,
    dateReviewed: "2022-04-20T00:00:00",
    comments: "bland af but edible I guess",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 27,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-20T00:00:00",
      comments: "bland af but edible I guess",
    },
    {
      id: 2,
      itemId: 29,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-04-20T00:00:00",
      comments: "best veggie pizza ever",
    },
    {
      id: 3,
      itemId: 29,
      reviewerEmail: "ldelplaya@ucsb.edu",
      stars: 0,
      dateReviewed: "2022-04-21T00:00:00",
      comments: "not tryna get food poisoning, but if I were this would do it",
    },
  ],
};

export { menuItemReviewFixtures };
