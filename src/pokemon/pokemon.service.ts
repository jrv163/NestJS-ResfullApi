import { Injectable, Controller, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class PokemonService {

  constructor(

    @InjectModel( Pokemon.name ) // Inyectamos modelos
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
        return pokemon;

    } catch (error) {
      // console.log( error )
      this.handleException( error );
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }


  async findOne(term: string) { // termino de busqueda

    let pokemon: Pokemon; // el pokemon es de tipo entity

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // MONGO ID
    if ( !pokemon && isValidObjectId( term ) ) {
        pokemon = await this.pokemonModel.findById( term )
    }

    // NAME
    if (  !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }


    if ( !pokemon ) 
       throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found `);

    return pokemon;
  }



 async update( term: string, updatePokemonDto: UpdatePokemonDto) { // para actualizar se debe verificar que existe el pokemon

      const pokemon = await this.findOne( term );

      if ( updatePokemonDto.name ) 
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

        try {
              await this.pokemonModel.updateOne( updatePokemonDto )   
              await pokemon.updateOne( updatePokemonDto ) 

      } catch (error) {
          this.handleException( error );
      }

          return { ...pokemon.toJSON(), ...updatePokemonDto };
      
    }
   
  

   async remove(id: string) {
      // const pokemon = await this.findOne( id )
      // await pokemon.deleteOne();
      // return { id }
    //  const result = await this.pokemonModel.findByIdAndDelete( id ); // se evita la doble consulta
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id }); // se evita la doble consulta

    if ( deletedCount === 0 )
        throw new BadRequestException(`Pokemon with id "${ id }" not found`)

      return;
  }



  private handleException( error: any ) {

    if ( error.code === 11000 ){ // codigo error arrojado por la consola
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify( error.keyValue ) }`) // keyValue es el valor arrojado por la consola
      }
      console.log( error );
      throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)

  }

}
