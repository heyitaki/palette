// This file exists as a json loading hack.

export const nodes = `[
  {
    "id": "1",
    "type": "person",
    "title": "Akshath Sivaprasad",
    "description": "This is a test.",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "2",
    "type": "company",
    "title": "Jane Street",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "3",
    "type": "person",
    "title": "Abhi Sivaprasad",
    "description": "",
    "url": "https://www.linkedin.com/in/abhisivaprasad/",
    "icon": "",
    "color": ""
  }
]`;

export const links = `[
  {
    "id": "1",
    "title": "brother",
    "sourceId": "1",
    "targetId": "3"
  },
  {
    "id": "2",
    "title": "works at",
    "sourceId": "3",
    "targetId": "2"
  }
]`;
