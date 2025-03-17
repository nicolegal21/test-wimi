import {app, server} from '../api';
import request from 'supertest';

import * as projectsService from '../services/projects.service';

jest.mock('../services/projects.service', () => ({
    getMembers: jest.fn(),
    addMembers: jest.fn(),
    deleteMember: jest.fn()
}));

afterAll(async () => {
    server.close();
});

afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

describe("GET /projects/:projectId/members", () => {
    it("should send a status of 200 OK and an array of users as a body when projectId is a number", async () => {
        (projectsService.getMembers as jest.Mock).mockResolvedValue(
            [
                {
                    "id": 1,
                    "name": "Flo Dare",
                    "groups": [
                        "A"
                    ]
                },
                {
                    "id": 5,
                    "name": "Jordane Cartwright",
                    "groups": [
                        "A",
                        "C"
                    ]
                }
            ]
        );
        const response = await request(app).get('/projects/5/members');
        expect(response.status).toBe(200);
        expect(response.body).toBeTruthy();
    }),
    it("should send a status of 400 BAD REQUEST when projectId is not a number", async () => {
        (projectsService.getMembers as jest.Mock).mockResolvedValue({message: "Project id must be a number"});
        const response = await request(app).get('/projects/e/members');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Project id must be a number"});
    }),
    it("should send a status of 200 OK when projectId is negative", async () => {
        (projectsService.getMembers as jest.Mock).mockResolvedValue([]);
        const response = await request(app).get('/projects/-1/members');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    })
});

describe("POST /projects/:projectId/members", () => {
    it("should send a status of 201 CREATED and a body when projectId is a number and an array of user ids are provided", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue({user_ids: [2, 3, 5]});
        const response = (await request(app).post('/projects/5/members').send({user_ids: [2, 3, 5]}));
        expect(response.status).toBe(201);
        expect(response.body).toBeTruthy();
    }),
    it("should send a status of 400 BAD REQUEST and a body when projectId is a number and a body user_ids are not all numbers", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue(
            {message: "User ids must be numbers"}
        );
        const response = ((await request(app).post('/projects/5/members').send({user_ids: [2, 3, 'a']})));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "User ids must be numbers"});
    })
    it("should send a status of 400 BAD REQUEST and a body when projectId is not a number and an array of user ids are provided", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue(
            [2, 3, 5]
        );
        const response = (await request(app).post('/projects/a/members').send({user_ids: [2, 3, 5]}));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Project id must be a number"});
    }),
    it("should send a status of 400 BAD REQUEST and a body when projectId is a number and a body isn't provided", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue(
            [2, 3, 5]
        );
        const response = (await request(app).post('/projects/5/members'));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Body was empty"});
    })
});

describe("DELETE /:projectId/members/:userId", () => {
    it("should send a status of 204 NO CONTENT when projectId is a number and userId is a number", async () => {
        const response = (await request(app).delete('/projects/5/members/1'));
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    }),
    it("should send a status of 204 NO CONTENT when projectId is a negative number and userId is a number", async () => {
        const response = (await request(app).delete('/projects/-5/members/1'));
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    }),
    it("should send a status of 204 NO CONTENT when projectId is a number and userId is a negative number", async () => {
        const response = (await request(app).delete('/projects/5/members/-1'));
        expect(response.status).toBe(204);
        expect(response.body).toEqual({});
    }),
    it("should send a status of 400 BAD REQUEST when projectId is not a number and userId is a number", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue({message: "Project id and user id must be a number"});
        const response = (await request(app).delete('/projects/a/members/1'));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Project id and user id must be a number"});
    }),
    it("should send a status of 400 BAD REQUEST when projectId is a number and userId is not a number", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue({message: "Project id and user id must be a number"});
        const response = (await request(app).delete('/projects/5/members/a'));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Project id and user id must be a number"});
    }),
    it("should send a status of 400 BAD REQUEST when projectId is not a number and userId is not a number", async () => {
        (projectsService.addMembers as jest.Mock).mockResolvedValue({message: "Project id and user id must be a number"});
        const response = (await request(app).delete('/projects/a/members/a'));
        expect(response.status).toBe(400);
        expect(response.body).toEqual({message: "Project id and user id must be a number"});
    })
});