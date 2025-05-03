const RecommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 2,
    requestorEmail: "wanqian@ucsb.edu",
    professorEmail: "phtcon@ucsb.edu",
    explanation: "testing ",
    dateRequested: "1111-11-11T11:11:11",
    dateNeeded: "1111-11-11T11:11:11",
    done: false,
  },
  threeRecommendationRequest: [
    {
      id: 2,
      requestorEmail: "wanqian@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation: "testing",
      dateRequested: "1111-11-11T11:11:11",
      dateNeeded: "1111-11-11T11:11:11",
      done: false,
    },
    {
      id: 3,
      requestorEmail: "wanqian@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation: "nest",
      dateRequested: "1111-11-11T11:11:11",
      dateNeeded: "1111-11-11T11:11:11",
      done: false,
    },
    {
      id: 4,
      requestorEmail: "wanqian@ucsb.edu",
      professorEmail: "fgibou@ucsb.edu",
      explanation: "best",
      dateRequested: "1111-11-11T11:11:11",
      dateNeeded: "1111-11-11T11:11:11",
      done: true,
    },
  ],
};

export { RecommendationRequestFixtures };
