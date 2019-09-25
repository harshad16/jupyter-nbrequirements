/**
 * CLI.
 *
 * Command wrapper which acts as sort of a command line interface.
 *
 * @link   https://github.com/CermakM/jupyter-nbrequirements#readme
 * @file   This module implements a command wrapper.
 * @author Marek Cermak <macermak@redhat.com>
 * @since  0.0.1
 */

import Command, { DefaultArguments } from './command';
import { Context } from '../types';

import {
    Get,
    Set,
    Lock,
    Install,
    Kernel,
    Help,
} from './requirements'

/**
 * Execute given command in the current runtime context.
 *
 * @export
 * @param {string} command
 * @param {DefaultArguments} args
 * @param {HTMLDivElement} [element]
 * @param {Context} [context]
 * @returns
 */
export async function cli( command: string, args: DefaultArguments, element?: HTMLDivElement, context?: Context ) {
    let cmd: Command;
    switch ( command ) {

        /**
         * Get notebook requirements from the notebook metadata.
         * If the metadata are not set, gather library usage from the notebook.
         *
         * @param {Get.Arguments} args
         * @param {HTMLDivElement} element
         * @returns {Promise<void>}
         * @memberof Get
         */
        case 'get': cmd = new Get(); break

        /**
         * Set notebook requirements.
         * If `to_file` argument is provided, writes them to the Pipfile.
         *
         * @param {Set.Arguments} args
         * @memberof Set
         */
        case 'set': cmd = new Set(); break

        /**
         * Lock notebook requirements.
         * If `to_file` argument is provided, writes them to the Pipfile.lock.
         *
         * @param {Lock.Arguments} args
         * @param {HTMLDivElement} element
         * @returns {Promise<void>}
         * @memberof Lock
         */
        case 'lock': cmd = new Lock(); break

        /**
         * Install notebook requirements to a virtual environment.
         * If no such virtual environment exists, create it first.
         *
         * @param {Install.Arguments} args
         * @returns {Promise<void>}
         * @memberof Install
         */
        case 'install': cmd = new Install(); break

        /**
         * Create and/or set a new Jupyter kernel.
         *
         * @param {Kernel.Arguments} args
         * @param {HTMLDivElement} element
         * @returns {Promise<void>}
         * @memberof Kernel
         */
        case 'kernel': cmd = new Kernel(); break


        /** Display help and exit */
        default: cmd = new Help( command )
    }

    // Run the command
    return await cmd.run( args, element, context )
}