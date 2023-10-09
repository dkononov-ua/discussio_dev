/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import conee from 'src/db';
import { rename, unlink, readFile } from 'fs';
import { RowDataPacket } from 'mysql2';
import { AppService } from 'src/app.service';
import * as sharp from 'sharp';

@Injectable()
export class ImgService {
    constructor(private readonly appService: AppService) {}

    async saveImgF(files: any, inf: any, res: any) {
        const i = JSON.parse(inf.auth)
        let a = await this.appService.authentification(i)
        let fl = await this.appService.flatCheck(a.user_id, inf.flat_id)
        if (a && fl && files) {
            const type_file = '.' + files.mimetype.split('/')[1]
            if(type_file == '.jpg' || type_file == '.png' || type_file == '.img' || type_file == '.jpeg' || type_file == '.webp'){
                conee.query("INSERT INTO flat_img (flat_id, img) VALUES (?, ?)", [inf.flat_id, files.filename + type_file], (err, resuuuu) => {
                    if (err) {
                        unlink("../../code/Static/" + files.filename, () => {
                            res.status(200).json({ status: "Помилка збереження" });
                        })
                    } else {
                        conee.query('SELECT * FROM flat_img WHERE flat_id = ?;', [inf.flat_id], (er, re: RowDataPacket[]) => {
                            if (re.length >= 20) {
                                conee.query('DELETE FROM flat_img WHERE img = ?', [re[0].img])
                                unlink("../../code/Static/flat/" + re[0].img, () => { })
                            }
                            rename("../../code/Static/" + files.filename, "../../code/Static/" + files.filename + type_file, (err) => {
                                const inputFile = "../../code/Static/" + files.filename + type_file;
                                const outputFile = "../../code/Static/flat/" + files.filename + type_file;
                                readFile(inputFile, (errrrrr, data) => {
                                    if (errrrrr) {
                                        console.error(err);
                                        return;
                                    }
                                    sharp(data)
                                        .metadata()
                                        .then((metadata) => {
                                            let width: number
                                            let height: number
                                            if (metadata.width > 2500 || metadata.height > 2500) {
                                                width = Math.floor((metadata.width / 5000) * 600);// нова ширина
                                                height = Math.floor((metadata.height / 5000) * 600);// нова висота
                                            } else {
                                                width = Math.floor((metadata.width / 1000) * 600);// нова ширина
                                                height = Math.floor((metadata.height / 1000) * 600);// нова висота
                                            }
                                            sharp(inputFile).resize(width, height)
                                                .toFile(outputFile)
                                                .then(() => {
                                                    if (err) {
                                                        unlink(inputFile, () => { 1 })
                                                        unlink(outputFile, () => { 1 })
                                                        res.status(200).json({ status: "Помилка збереження" });
                                                    } else {
                                                        unlink(inputFile, () => { 1 })
                                                        res.status(200).json({ status: "Збережено" });
                                                    }
                                                })
                                                .catch((err) => {
                                                    unlink("../../code/Static/" + files.filename + type_file, () => { 1 })
                                                    // console.error('Помилка при зміні розміру зображення:', err);
                                                });
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                        });
                                });
                            })
                        })
                        res.status(200).json({ status: "Збережено" });
                    }
                })
            }else{
                unlink("../../code/Static/" + files.filename, () => {
                    res.status(200).json({ status: "Помилковий формат" });
                })
            }
            
        } else {
            unlink("../../code/Static/" + files.filename, () => {
                res.status(200).json({ status: "Авторизуйтесь" });
            })
        }
    }




    async sa(files: any, inf: any, res: any) {
        // const i = JSON.parse(inf.auth!)
        const type_file = '.' + files.mimetype.split('/')[1]
        rename("../../code/Static/" + files.filename, "../../code/Static/flat/" + files.filename + type_file, (err) => { })
        res.status(200).json({ status: "Фото квартири успішно збережене" });
    }


    async saveImgU(files: any, inf: any, res: any) {
        const i = JSON.parse(inf.auth)
        let a = await this.appService.authentification(i)
        if (a && files) {
            const type_file = '.' + files.mimetype.split('/')[1]
            if(type_file == '.jpg' || type_file == '.png' || type_file == '.img' || type_file == '.jpeg' || type_file == '.webp'){
                conee.query('SELECT * FROM user_img WHERE user_id = ?;', [a.user_id], (er, re:any) => {
                    if (re[0].img != "user_default.svg") {
                        conee.query('DELETE FROM user_img WHERE img = ?', [re[0].img])
                        unlink("../../code/Static/users/" + re[0].img, (e) => { console.log(e) })
                    }else if(re[0].img == "user_default.svg"){
                        conee.query('DELETE FROM user_img WHERE img = ?', [re[0].img])
                    }
                    rename("../../code/Static/" + files.filename, "../../code/Static/" + files.filename + type_file, (err) => {
                        const inputFile = "../../code/Static/" + files.filename + type_file;
                        const outputFile = "../../code/Static/users/" + files.filename + type_file;
                        readFile(inputFile, (err, data) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            sharp(data)
                                .metadata()
                                .then((metadata) => {
                                    let width: number
                                    let height: number
                                    if (metadata.width > 2500 || metadata.height > 2500) {
                                        width = Math.floor((metadata.width / 5000) * 600);// нова ширина
                                        height = Math.floor((metadata.height / 5000) * 600);// нова висота
                                    } else {
                                        width = Math.floor((metadata.width / 1000) * 600);// нова ширина
                                        height = Math.floor((metadata.height / 1000) * 600);// нова висота
                                    }
                                    sharp(inputFile).resize(width, height)
                                        .toFile(outputFile)
                                        .then(() => {
                                            conee.query("INSERT INTO user_img (user_id, img) VALUES (?, ?)", [a.user_id, files.filename + type_file],
                                                (errrr) => {
                                                    if (errrr) {
                                                        unlink(inputFile, () => { })
                                                        unlink(outputFile, () => { })
                                                        res.status(200).json({ status: "Помилка збереження" });
                                                    } else {
                                                        unlink(inputFile, () => { })
                                                        res.status(200).json({ status: "Збережено" });
                                                    }
                                                })
                                        })
                                        .catch((err) => {
                                            unlink("../../code/Static/" + files.filename + type_file, () => { })
                                            console.error('Помилка при зміні розміру зображення:', err);
                                        });
                                })
                                .catch((error) => {
                                    console.error(error);
                                });
                        })
                    })
                })
            }else{
                unlink("../../code/Static/" + files.filename, () => {
                    res.status(200).json({ status: "Помилковий формат" });
                })
            }
        } else {
            unlink("../../code/Static/" + files.filename, () => {
                res.status(200).json({ status: "Авторизуйтесь" });
            })
        }
    }



    async saveImgFilling(files: any, inf: any, res: any) {   
        const i = JSON.parse(inf.auth)
        let b = JSON.parse(inf.inf)
        console.log(b)
        console.log(inf)
        console.log(files)
        let a = await this.appService.authentification(i)
        if(a){
            let fl = await this.appService.flatCheck(a.user_id, b.flat_id)
            if(fl){
                if(files){
                    const type_file = '.' + files.mimetype.split('/')[1]
                    if(type_file == '.jpg' || type_file == '.png' || type_file == '.img' || type_file == '.jpeg' || type_file == '.webp'){
                        rename("../../code/Static/" + files.filename, "../../code/Static/" + files.filename + type_file, (err) => {
                            const inputFile = "../../code/Static/" + files.filename + type_file;
                            const outputFile = "../../code/Static/filling/" + files.filename + type_file;
                            readFile(inputFile, (err, data) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                sharp(data)
                                    .metadata()
                                    .then((metadata) => {
                                        let width: number
                                        let height: number
                                        if (metadata.width > 2500 || metadata.height > 2500) {
                                            width = Math.floor((metadata.width / 5000) * 600);// нова ширина
                                            height = Math.floor((metadata.height / 5000) * 600);// нова висота
                                        } else {
                                            width = Math.floor((metadata.width / 1000) * 600);// нова ширина
                                            height = Math.floor((metadata.height / 1000) * 600);// нова висота
                                        }
                                        sharp(inputFile).resize(width, height)
                                            .toFile(outputFile)
                                            .then(() => {
                                                conee.query("INSERT INTO filling (flat_id, img, about_filling, name_filling, type_filling, number_filling, condition_filling) VALUES (?, ?, ?, ?, ?, ?, ?)", [b.flat_id, files.filename + type_file, b.about_filling, b.name_filling, b.type_filling, b.number_filling, b.condition_filling],
                                                    (errrr) => {
                                                        if (errrr) {
                                                            unlink(inputFile, () => { })
                                                            unlink(outputFile, () => { })
                                                            res.status(200).json({ status: "Помилка збереження" });
                                                        } else {
                                                            unlink(inputFile, () => { })
                                                            res.status(200).json({ status: "Збережено" });
                                                        }
                                                    })
                                            })
                                            .catch((err) => {
                                                unlink("../../code/Static/" + files.filename + type_file, () => { })
                                                console.error('Помилка при зміні розміру зображення:', err);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });
                            })
                        })
                    }else{
                        try {
                            unlink("../../code/Static/" + files.filename, () => {
                                res.status(200).json({ status: "Помилковий формат" });
                            })
                        } catch (err) {
                            throw err
                        }
                    }
                }else{
                    conee.query("INSERT INTO filling (flat_id, about_filling, name_filling, type_filling, number_filling, condition_filling) VALUES (?, ?, ?, ?, ?, ?)", [b.flat_id, b.about_filling, b.name_filling, b.type_filling, b.number_filling, b.condition_filling],
                    (errr) => {
                    if (errr) {
                        res.status(200).json({ status: "Помилка збереження" });
                    } else {
                        res.status(200).json({ status: "Збережено" });
                    }
                })
                }
            }else{
                let admin = await this.appService.citizen(a.user_id, b.flat_id)
                if(admin.acces_filling){
                    if(files){
                        const type_file = '.' + files.mimetype.split('/')[1]
                        if(type_file == '.jpg' || type_file == '.png' || type_file == '.img' || type_file == '.jpeg' || type_file == '.webp'){
                            rename("../../code/Static/" + files.filename, "../../code/Static/" + files.filename + type_file, (err) => {
                                const inputFile = "../../code/Static/" + files.filename + type_file;
                                const outputFile = "../../code/Static/filling/" + files.filename + type_file;
                                readFile(inputFile, (err, data) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    sharp(data)
                                        .metadata()
                                        .then((metadata) => {
                                            let width: number
                                            let height: number
                                            if (metadata.width > 2500 || metadata.height > 2500) {
                                                width = Math.floor((metadata.width / 5000) * 600);// нова ширина
                                                height = Math.floor((metadata.height / 5000) * 600);// нова висота
                                            } else {
                                                width = Math.floor((metadata.width / 1000) * 600);// нова ширина
                                                height = Math.floor((metadata.height / 1000) * 600);// нова висота
                                            }
                                            sharp(inputFile).resize(width, height)
                                                .toFile(outputFile)
                                                .then(() => {
                                                    conee.query("INSERT INTO filling (flat_id, img, about_filling, name_filling, type_filling, number_filling, condition_filling) VALUES (?, ?, ?, ?, ?, ?, ?)", [b.flat_id, files.filename + type_file, b.about_filling, b.name_filling, b.type_filling, b.number_filling, b.condition_filling],
                                                        (errrr) => {
                                                            if (errrr) {
                                                                unlink(inputFile, () => { })
                                                                unlink(outputFile, () => { })
                                                                res.status(200).json({ status: "Помилка збереження" });
                                                            } else {
                                                                unlink(inputFile, () => { })
                                                                res.status(200).json({ status: "Збережено" });
                                                            }
                                                        })
                                                })
                                                .catch((err) => {
                                                    unlink("../../code/Static/" + files.filename + type_file, () => { })
                                                    console.error('Помилка при зміні розміру зображення:', err);
                                                });
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                        });
                                })
                            })
                        }else{
                            try {
                                unlink("../../code/Static/" + files.filename, () => {
                                    res.status(200).json({ status: "Помилковий формат" });
                                })
                            } catch (err) {
                                throw err
                            }
                        }
                    }else{
                        conee.query("INSERT INTO filling (flat_id, about_filling, name_filling, type_filling, number_filling, condition_filling) VALUES (?, ?, ?, ?, ?, ?)", [b.flat_id, b.about_filling, b.name_filling, b.type_filling, b.number_filling, b.condition_filling],
                        (errr) => {
                            if (errr) {
                                res.status(200).json({ status: "Помилка збереження" });
                            } else {
                                res.status(200).json({ status: "Збережено" });
                            }
                        })
                    }
                }else{
                    try {
                        unlink("../../code/Static/" + files.filename, () => {
                            res.status(200).json({ status: "Немає доступу" });
                        })
                    } catch (err) {
                        throw err
                    }
                }
            }
        }else{
            try {
                unlink("../../code/Static/" + files.filename, () => {
                    res.status(200).json({ status: "Авторизуйтесь" });
                })
            } catch (err) {
                throw err
            }
        }
    }       



}