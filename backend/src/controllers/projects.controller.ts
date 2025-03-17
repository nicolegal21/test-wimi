import { Request, Response } from "express";
import * as projectsService from '../services/projects.service';

export async function getMembers(req: Request, res: Response) {    
    const projectId = Math.abs(Number.parseInt(req.params.id, 10));
    if(isNaN(projectId)) {
        return res.status(400).send({message: "Project id must be a number"});
    } else {
        try {
            const result = await projectsService.getMembers(projectId);
            return res.status(200).send(result);
        } catch(err) {
            return res.status(500).send(`A server error occured: ${err}`);
        }
    }
};

export async function addMembers(req: Request, res: Response) {
    const projectId = Math.abs(Number.parseInt(req.params.id, 10));
    const userIds = req.body.user_ids;
    if(!userIds) {
        return res.status(400).send({message: "Body was empty"});
    }
    if(!userIds.every((id: any) => {return typeof id === 'number';})) {
        return res.status(400).send({message: "User ids must be numbers"});
    }
    if(isNaN(projectId)) {
        return res.status(400).send({message: "Project id must be a number"});
    } else {
        try {
            const result = await projectsService.addMembers(projectId, userIds);
            return res.status(201).send(result);
        } catch(err) {
            return res.status(500).send({message: `A server error occured: ${err}`});
        }
    }
}

export async function deleteMember(req: Request, res: Response) {
    const projectId = Math.abs(Number.parseInt(req.params.projectId, 10));
    const userId = Math.abs(Number.parseInt(req.params.userId, 10));
    if(isNaN(projectId) || isNaN(userId)) {
        return res.status(400).send({message: "Project id and user id must be a number"});
    } else {
        try {
            await projectsService.deleteMember(projectId, userId);
            return res.status(204).send();
        } catch(err) {
            return res.status(500).send({message: `A server error occured: ${err}`});
        }
    }
}