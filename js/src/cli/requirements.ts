import _ from "lodash";

import Command, { DefaultArguments } from './command'

import { execute_python_script } from '../core'
import {
    get_requirements,
    set_requirements,
    get_requirements_locked
} from '../notebook'
import {
    Pipfile,
    PipfileLock,
    install_requirements,
    install_kernel,
    load_kernel,
    set_kernel
} from '../thoth'

import * as utils from '../utils'

import * as io from '../types/io'
import { Requirements } from '../types/requirements'

// Jupyter runtime environment
// @ts-ignore
import Jupyter = require( "base/js/namespace" )


export class Help extends Command {
    public readonly message: string

    constructor( cmd?: string ) {
        super()

        if ( cmd )
            this.message = `Unknown command '${ cmd }'. See --help for more info.`
        else
            this.message = "Provide a valid JS command. See --help for more info."
    }

    public run( args: any, element: HTMLDivElement ): void {
        // Append to the cell output
        utils.display( this.message, element )
    }
}

namespace Get {

    export interface Arguments extends DefaultArguments { }

}
export class Get extends Command {

    /**
     * Get notebook requirements from the notebook metadata.
     * If the metadata are not set, gather library usage from the notebook.
     *
     * @param {Get.Arguments} args
     * @param {HTMLDivElement} element
     * @returns {Promise<void>}
     * @memberof Get
     */
    public async run( args: Get.Arguments, element: HTMLDivElement ): Promise<void> {
        this.validate( args )
        try {
            let req = await get_requirements( Jupyter.notebook, args.ignore_metadata )
            if ( args.to_json ) {
                // Append to the cell output
                utils.display( req, element )
            }
            else if ( args.to_file ) {// Create the Pipfile in the current repository
                return await Pipfile.create( req )
                    .then( () => {
                        console.log( "Pipfile has been sucessfully created." )
                    } )
                    .catch( ( err: string | Error ) => {
                        console.error( err )
                    } )
            }
            else {// default, display requirements in Pipfile format
                const json = JSON.stringify( req )
                // TODO: Turn this into a template
                await execute_python_script(
                    utils.dedent( `\n                    from thoth.python import Pipfile\n                    print(\n                        Pipfile.from_dict(json.loads('${ json }')).to_string()\n                    )` )
                )
            }
        }
        catch ( err ) {
            console.error( "Failed to get requirements.\n", err )
        }
    }
}

namespace Set {

    export interface Arguments extends DefaultArguments {
        requirements: Requirements
    }

}
export class Set extends Command {

    /**
     * Set notebook requirements.
     * If `to_file` argument is provided, writes them to the Pipfile.
     *
     * @param {Set.Arguments} args
     * @memberof Set
     */
    public run( args: Set.Arguments ): void {
        const req: Requirements = args.requirements

        set_requirements( Jupyter.notebook, req )
    }
}

namespace Lock {

    export interface Arguments extends DefaultArguments {
        sync: boolean
    }

}
export class Lock extends Command {

    /**
     * Lock notebook requirements.
     * If `to_file` argument is provided, writes them to the Pipfile.lock.
     *
     * @param {Lock.Arguments} args
     * @param {HTMLDivElement} element
     * @returns {Promise<void>}
     * @memberof Lock
     */
    public async run( args: Lock.Arguments, element: HTMLDivElement ): Promise<void> {
        get_requirements_locked( Jupyter.notebook, args.ignore_metadata, args.sync )
            .then( async ( req_locked ) => {
                if ( args.to_file ) {
                    return await PipfileLock.create( req_locked )
                        .then( () => {
                            console.log( "Pipfile.lock has been successfully created." )
                        } )
                        .catch( ( err ) => {
                            console.error( "Failed to lock down dependencies.\n", err )
                        } )
                }

                // default, display requirements in Pipfile.lock format
                utils.display( req_locked, element )
            } )
            .catch( ( err ) => {
                console.error( "Failed to lock requirements.\n", err )
            } )
    }
}

namespace Install {

    export interface Arguments extends DefaultArguments {
        requirements: string[]
        dev: boolean
        pre: boolean
    }

}
export class Install extends Command {

    /**
     * Install notebook requirements to a virtual environment.
     * If no such virtual environment exists, create it first.
     *
     * @param {Install.Arguments} args
     * @returns {Promise<void>}
     * @memberof Install
     */
    public async run( args: Install.Arguments ): Promise<void> {
        await install_requirements( args.requirements, args.dev, args.pre )
    }
}

namespace Kernel {

    type KernelCommand = "info" | "install" | "set"

    export interface Arguments extends DefaultArguments {
        name: string
        sub_command: KernelCommand
    }

}
export class Kernel extends Command {

    /**
     * Create and/or set a new Jupyter kernel.
     *
     * @param {Kernel.Arguments} args
     * @param {HTMLDivElement} element
     * @returns {Promise<void>}
     * @memberof Kernel
     */
    public async run( args: Kernel.Arguments, element: HTMLDivElement ): Promise<void> {
        const kernel = Jupyter.notebook.kernel

        if ( args.sub_command === "install" ) {
            install_kernel( args.name )
                .then( ( name: string ) => load_kernel( name ) )
                .then( ( name: string ) => console.log( `Kernel spec '${ name }' is ready.` ) )
        }
        else if ( args.sub_command === "set" ) {
            console.log( `Setting kernel '${ name }'` )

            set_kernel( args.name )
                .then( ( name: string ) => console.log( `Kernel '${ name }' has been set.` ) )
        }
        else {// display kernel info and exit
            kernel.kernel_info( ( msg: io.Message ) => {
                const content = Object.entries( _.omit( msg.content, [ "banner", "help_links" ] ) ).sort()
                const kernel_info = {
                    name: Jupyter.notebook.kernel.name,
                    ..._.fromPairs( content )
                }

                utils.display( kernel_info, element )
            } )
        }
    }
}