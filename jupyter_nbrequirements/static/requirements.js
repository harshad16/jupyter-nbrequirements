"use strict";

const args = $$magic_args

Jupyter.notebook.get_requirements(args.ignore_metadata)
    .then(async (r) => {
        if (args.to_json) {
            display(r, element)
        }

        else if (args.to_file) {
            return await create_pipfile(r, args.overwrite)
        }

        else {
            // default, display requirements in Pipfile format
            r = JSON.stringify(r)
            return await execute_python_script(
                dedent`print(
                    Pipfile.from_dict(json.loads('${r}')).to_string()
                )`
            )
        }
    })
    .catch((err) => {
        console.error("Failed to get requirements.\n", err)
    })