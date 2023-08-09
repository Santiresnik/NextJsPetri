import { prisma } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import { camionPayload, Props } from '@/types'
import {
  checkTag, trimObjectStr, isValidCamion,
  checkDuplicatePatente, filterObject
} from '@/utils'

export async function GET(req: Request, { params: { tag } }: Props) {
  try {
    const result = await prisma.camiones.findUnique({
      where: {
        tag: tag
      }
    })
    let output = `GET a /api/camiones/${tag}`
    console.log(output)
    if (result) {
      return NextResponse.json(result, { status: 200 })
    }
    output = "No se encontro el camion con el tag correspondiente"
    return NextResponse.json({ mensaje: output }, { status: 404 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}

export async function PUT(req: Request, { params: { tag } }: Props) {
  let id: string

  let res = await checkTag(tag)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      id = res
      break
  }

  let payload: camionPayload = await req.json()
  if (!isValidCamion(payload, 'deny')) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  let containsEmpty: string
  [payload, containsEmpty] = trimObjectStr(payload)

  if (containsEmpty) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  res = await checkTag(payload.tag)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      break

    default:
      let output = "Ya hay otro camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })
  }
  res = await checkDuplicatePatente(payload.patente)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      break

    default:
      let output = "Ya hay otro camion con la patente correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })
  }

  try {
    await prisma.camiones.update({
      where: {
        tag: tag
      },
      data: {
        tag: payload.tag,
        patente: payload.patente,
        modelo: payload.modelo,
        capacidad: payload.capacidad,
        compania: payload.compania
      }
    })
    let output = `Patente: ${payload.patente}%, modelo: ${payload.modelo}°C, Capacidad:${payload.capacidad} Compania: ${payload.compania}, ID: ${id}`
    console.log(output)
    return NextResponse.json({ ID: id }, { status: 200 })
  }

  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params: { tag } }: Props) {
  let res = await checkTag(tag)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:

      break
  }
  const keys = ["tag", "patente", "modelo", "compania", "capacidad"]
  const body = await req.json()
  let payload: camionPayload = filterObject(body, keys)
  if (!isValidCamion(payload, 'permit')) {
    let output = 'Formato incorrecto 1'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  let containsEmpty: boolean
  [payload, containsEmpty] = trimObjectStr(payload)
  if (containsEmpty) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  if (typeof payload.tag !== 'undefined') {
    res = await checkTag(payload.tag)
    switch (res) {
      case "Error":
        return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

      case "Not Found":
        break

      default:
        let output = "Ya hay otro camion con el tag correspondiente"
        console.log(output)
        return NextResponse.json({ mensaje: output }, { status: 404 })
    }
  }
  if (typeof payload.patente !== 'undefined') {
    res = await checkDuplicatePatente(payload.patente)
    switch (res) {
      case "Error":
        return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

      case "Not Found":
        break

      default:
        let output = "Ya hay otro camion con la patente correspondiente"
        console.log(output)
        return NextResponse.json({ mensaje: output }, { status: 404 })
    }
  }
  try {
    await prisma.camiones.update({
      where: {
        tag: tag
      },
      data: payload
    })
    const jsonStr = JSON.stringify(payload, null, 2)
    const output = "Valores actualizados:\n" + jsonStr
    console.log(output)
    return NextResponse.json({ actualizado: payload }, { status: 200 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params: { tag } }: Props) {
  let id: string
  let res = await checkTag(tag)
  switch (res) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      id = res
      break
  }
  try {
    const result = await prisma.camiones.delete({
      where: {
        tag: tag
      }
    })
    let output = `Recurso borrado con ID: ${id}`
    console.log(output)
    console.log(result)
    return NextResponse.json({ mensaje: output }, { status: 200 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}