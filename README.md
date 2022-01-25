# xpi-creator

Building unsigned XPI files for firefox is annoying. This program automates that process. Usage:

```sh
xpi-creator <src_folder> <dest.xpi>
```

## Example

Here is an example of how you would package [cascade](https://github.com/andreasgrafen/cascade).

```sh
git clone https://github.com/andreasgrafen/cascade.git
xpi-creator cascade/ cascade.xpi
```
