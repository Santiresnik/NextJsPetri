import { prisma } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import { sensoresPayload } from '@/types'
import { checkUnique, isValidSensor } from '@/utils'
import { Props } from '@/types'

export async function GET(req: NextRequest, { params: { tag } }: Props) {
  let exists: string = await checkUnique({tag: tag}, 'camiones')
  switch (exists) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      break
  }

  try {
    const result = await prisma.sensores.findMany({
      where: {
        idCamion: tag
      }
    })
    if (result.length === 0) {
      let output = "Este camion no tiene datos de sensores"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })
    }
    let output = `GET a /api/camiones/${tag}`
    console.log(output)
    return NextResponse.json(result, { status: 200 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}

export async function POST(req: Request, { params: { tag } }: Props) {
  let exists: string = await checkUnique({tag: tag}, 'camiones')
  switch (exists) {
    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })

    case "Not Found":
      let output = "No se encontro un camion con el tag correspondiente"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 404 })

    default:
      break
  }

  const payload: sensoresPayload = await req.json()

  if (!isValidSensor(payload)) {
    let output = 'Formato incorrecto'
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }

  payload.tiempoMedicion = payload.tiempoMedicion.trim()

  if (payload.tiempoMedicion === '' || new Date(Date.now()) < new Date(payload.tiempoMedicion)) {
    let output = "Fecha invalida"
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  const fields = {
    AND: 
    [
      {idCamion: tag},
      {tiempoMedicion: payload.tiempoMedicion}
    ]
  }
  exists = await checkUnique(fields, 'sensores')
  switch (exists) {
    case "Not Found":
      break

    case "Error":
      return NextResponse.json({ mensaje: "Error del servidor" }, { status: 500 })
    
      default:
      let output = "Este camion ya tiene una medicion con esa fecha"
      console.log(output)
      return NextResponse.json({ mensaje: output }, { status: 400 })
  }
  try {
    let result = await prisma.sensores.create({
      data: {
        temperatura: payload.temperatura,
        humedad: payload.humedad,
        latitud: payload.latitud,
        longitud: payload.longitud,
        tiempoMedicion: payload.tiempoMedicion,
        idCamion: tag
      }
    })
    let output = `Recurso creado con ID: ${result.id}`
    console.log(output)
    return NextResponse.json({ mensaje: output }, { status: 201 })
  }
  catch (err) {
    console.log(err)
    return NextResponse.json({ mensaje: err }, { status: 500 })
  }
}