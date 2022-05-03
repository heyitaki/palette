// This file exists as a json loading hack.

export const nodes = `[
  {
    "id": "1",
    "type": "person",
    "title": "Akshath Sivaprasad",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "2",
    "type": "person",
    "title": "Abhi Sivaprasad",
    "description": "",
    "url": "https://www.linkedin.com/in/abhisivaprasad/",
    "icon": "",
    "color": ""
  },
  {
    "id": "3",
    "type": "person",
    "title": "Danny Wang",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "4",
    "type": "person",
    "title": "Alice Deng",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "5",
    "type": "person",
    "title": "Ali Ahmed",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "6",
    "type": "school",
    "title": "UC Berkeley",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "7",
    "type": "school",
    "title": "Yale",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "8",
    "type": "organization",
    "title": "Y Combinator",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "9",
    "type": "company",
    "title": "Pantheon",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "10",
    "type": "company",
    "title": "Lang",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  },
  {
    "id": "11",
    "type": "company",
    "title": "Slope",
    "description": "",
    "url": "",
    "icon": "",
    "color": ""
  }
]`;

export const links = `[
  {
    "id": "1",
    "title": "brother",
    "sourceId": "1",
    "targetId": "2",
    "bidirectional": true
  },
  {
    "id": "2",
    "title": "friend",
    "sourceId": "1",
    "targetId": "3",
    "bidirectional": true
  },
  {
    "id": "3",
    "title": "friend",
    "sourceId": "1",
    "targetId": "4",
    "bidirectional": true
  },
  {
    "id": "4",
    "title": "co-founder",
    "sourceId": "1",
    "targetId": "5",
    "bidirectional": true
  },
  {
    "id": "5",
    "title": "attended",
    "sourceId": "1",
    "targetId": "6",
    "bidirectional": false
  },
  {
    "id": "6",
    "title": "attended",
    "sourceId": "4",
    "targetId": "6",
    "bidirectional": false
  },
  {
    "id": "7",
    "title": "attended",
    "sourceId": "5",
    "targetId": "6",
    "bidirectional": false
  },
  {
    "id": "8",
    "title": "attended",
    "sourceId": "2",
    "targetId": "7",
    "bidirectional": false
  },
  {
    "id": "9",
    "title": "founded",
    "sourceId": "1",
    "targetId": "9",
    "bidirectional": false
  },
  {
    "id": "10",
    "title": "founded",
    "sourceId": "2",
    "targetId": "10",
    "bidirectional": false
  },
  {
    "id": "11",
    "title": "founded",
    "sourceId": "4",
    "targetId": "11",
    "bidirectional": false
  },
  {
    "id": "12",
    "title": "founded",
    "sourceId": "5",
    "targetId": "9",
    "bidirectional": false
  },
  {
    "id": "13",
    "title": "funded",
    "sourceId": "8",
    "targetId": "9",
    "bidirectional": false
  },
  {
    "id": "14",
    "title": "funded",
    "sourceId": "8",
    "targetId": "10",
    "bidirectional": false
  },
  {
    "id": "15",
    "title": "funded",
    "sourceId": "8",
    "targetId": "11",
    "bidirectional": false
  }
]`;
